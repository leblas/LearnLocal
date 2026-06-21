'use client';

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Mic } from 'lucide-react';

export type PushToTalkState =
  | 'idle'
  | 'recording'
  | 'processing'
  | 'speaking'
  | 'finished'
  | 'error';

const MIN_RECORD_MS = 500;
const MAX_RECORD_MS = 20_000;

interface PushToTalkProps {
  language:     'English' | 'Spanish';
  state:        PushToTalkState;
  disabled?:    boolean;
  onRecordingStart?: () => void;
  onTranscript: (text: string) => void;
  onError:      (message: string) => void;
  onStateChange?: (state: PushToTalkState) => void;
}

const labels = {
  en: {
    idle:       '🎤 Hold to Speak',
    recording:  '🔴 Listening...',
    processing: '🧠 Personalizing...',
    speaking:   '🔊 Teaching...',
    finished:   '✅ Lesson added to your journey',
    error:      '⚠️ Voice unavailable',
  },
  es: {
    idle:       '🎤 Mantén para hablar',
    recording:  '🔴 Escuchando...',
    processing: '🧠 Personalizando...',
    speaking:   '🔊 Enseñando...',
    finished:   '✅ Lección guardada en tu camino',
    error:      '⚠️ Voz no disponible',
  },
};

export function startRecording(
  stream: MediaStream,
  onData: (blob: Blob) => void,
  onTooShort: () => void,
  startTimeRef: MutableRefObject<number>,
  chunksRef: MutableRefObject<BlobPart[]>,
  recorderRef: MutableRefObject<MediaRecorder | null>,
): void {
  chunksRef.current = [];
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  const recorder = new MediaRecorder(stream, { mimeType });
  recorderRef.current = recorder;
  startTimeRef.current = Date.now();

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunksRef.current.push(e.data);
  };

  recorder.onstop = () => {
    const duration = Date.now() - startTimeRef.current;
    if (duration < MIN_RECORD_MS) {
      onTooShort();
      return;
    }
    const blob = new Blob(chunksRef.current, { type: mimeType });
    onData(blob);
  };

  recorder.start(100);
}

export function stopRecording(
  recorderRef: MutableRefObject<MediaRecorder | null>,
): void {
  const recorder = recorderRef.current;
  if (recorder && recorder.state !== 'inactive') {
    recorder.stop();
  }
}

export async function transcribeAudio(
  blob: Blob,
  language: 'English' | 'Spanish',
): Promise<{ text: string }> {
  const formData = new FormData();
  formData.append('audio', blob, 'recording.webm');
  formData.append('language', language);

  const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Transcription failed');
  }

  return { text: data.text as string };
}

export default function PushToTalk({
  language,
  state,
  disabled = false,
  onRecordingStart,
  onTranscript,
  onError,
  onStateChange,
}: PushToTalkProps) {
  const langKey = language === 'Spanish' ? 'es' : 'en';
  const t = labels[langKey];

  const streamRef    = useRef<MediaStream | null>(null);
  const recorderRef  = useRef<MediaRecorder | null>(null);
  const chunksRef    = useRef<BlobPart[]>([]);
  const startTimeRef = useRef(0);
  const maxTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBusyRef    = useRef(false);
  const [level, setLevel] = useState(0);

  const analyserRef  = useRef<AnalyserNode | null>(null);
  const animRef      = useRef<number | null>(null);

  const statusLabel = (() => {
    switch (state) {
      case 'recording':  return t.recording;
      case 'processing': return t.processing;
      case 'speaking':   return t.speaking;
      case 'finished':   return t.finished;
      case 'error':      return t.error;
      default:           return t.idle;
    }
  })();

  const ensureMic = useCallback(async (): Promise<MediaStream> => {
    if (streamRef.current) return streamRef.current;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    return stream;
  }, []);

  const stopLevelMeter = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
    setLevel(0);
  }, []);

  const startLevelMeter = useCallback((stream: MediaStream) => {
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setLevel(Math.min(100, Math.round((avg / 128) * 100)));
      animRef.current = requestAnimationFrame(tick);
    };
    tick();
  }, []);

  const handleStop = useCallback(() => {
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    stopLevelMeter();
    stopRecording(recorderRef);
  }, [stopLevelMeter]);

  const handleStart = useCallback(async () => {
    if (disabled || isBusyRef.current || state === 'processing' || state === 'speaking') return;

    try {
      onRecordingStart?.();
      onStateChange?.('recording');
      const stream = await ensureMic();
      startLevelMeter(stream);

      startRecording(
        stream,
        async (blob) => {
          if (isBusyRef.current) return;
          isBusyRef.current = true;
          try {
            onStateChange?.('processing');
            const { text } = await transcribeAudio(blob, language);
            onTranscript(text);
          } catch (err) {
            onError(err instanceof Error ? err.message : 'Voice unavailable');
            onStateChange?.('error');
          } finally {
            isBusyRef.current = false;
          }
        },
        () => {
          onStateChange?.('idle');
          isBusyRef.current = false;
        },
        startTimeRef,
        chunksRef,
        recorderRef,
      );

      maxTimerRef.current = setTimeout(() => {
        stopRecording(recorderRef);
        stopLevelMeter();
      }, MAX_RECORD_MS);
    } catch {
      onError('Microphone access denied');
      onStateChange?.('error');
      isBusyRef.current = false;
    }
  }, [
    disabled, state, language, ensureMic, startLevelMeter, stopLevelMeter,
    onRecordingStart, onTranscript, onError, onStateChange,
  ]);

  useEffect(() => {
    return () => {
      stopLevelMeter();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    };
  }, [stopLevelMeter]);

  const isRecording = state === 'recording';
  const isLocked    = disabled || state === 'processing' || state === 'speaking';

  return (
    <div className="space-y-3">
      {/* Status pill */}
      <div
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all"
        style={{
          background: isRecording ? '#fef2f2' : state === 'speaking' ? '#eff6ff' : '#f5f3ff',
          color:      isRecording ? '#dc2626' : state === 'speaking' ? '#2563eb' : '#6d28d9',
          border:     `1.5px solid ${isRecording ? '#fecaca' : state === 'speaking' ? '#bfdbfe' : '#ddd6fe'}`,
        }}
      >
        {state === 'processing' && (
          <div className="w-3.5 h-3.5 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
        )}
        {statusLabel}
      </div>

      {/* Waveform / level indicator */}
      {isRecording && (
        <div className="flex items-end justify-center gap-1 h-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 rounded-full transition-all duration-75"
              style={{
                height: `${Math.max(4, (level / 100) * 32 * (0.5 + (i % 3) * 0.25))}px`,
                background: '#ef4444',
                opacity: 0.4 + (level / 100) * 0.6,
              }}
            />
          ))}
        </div>
      )}

      {/* Hold-to-speak button */}
      <button
        id="btn-push-to-talk"
        type="button"
        disabled={isLocked}
        onPointerDown={(e) => { e.preventDefault(); handleStart(); }}
        onPointerUp={(e) => { e.preventDefault(); if (isRecording) handleStop(); }}
        onPointerLeave={(e) => { if (isRecording) { e.preventDefault(); handleStop(); } }}
        onContextMenu={(e) => e.preventDefault()}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm text-white transition-all duration-200 select-none touch-none"
        style={{
          background: isRecording
            ? 'linear-gradient(90deg,#ef4444,#dc2626)'
            : isLocked
              ? '#d6d3d1'
              : 'linear-gradient(90deg,#8b5cf6,#6366f1)',
          boxShadow: isRecording
            ? '0 8px 24px rgba(239,68,68,0.35)'
            : '0 8px 24px rgba(99,102,241,0.3)',
          cursor: isLocked ? 'not-allowed' : 'pointer',
        }}
      >
        <Mic size={18} />
        {langKey === 'es' ? 'Mantén para hablar' : 'Hold to Speak'}
      </button>
    </div>
  );
}
