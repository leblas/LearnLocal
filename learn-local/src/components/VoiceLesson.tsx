'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PushToTalk, { type PushToTalkState } from '@/components/PushToTalk';
import { Volume2, Square, RotateCcw } from 'lucide-react';

export interface LessonResult {
  foodStory:  string;
  learn:      string;
  impact:     string;
  takeAction: string;
  funFact:    string;
}

interface VoiceLessonProps {
  food:              string;
  learnerType:       'kid' | 'student' | 'adult';
  language:          'English' | 'Spanish';
  learningStyle:     string;
  lang:              'en' | 'es';
  externalLesson?:   LessonResult | null;
  initialTranscript?: string | null;
  onLessonReady:     (lesson: LessonResult, meta: { redisConnected: boolean; transcript?: string }) => void;
  onLoading:         () => void;
  onError:           (message: string) => void;
  autoSpeak?:        boolean;
}

const ui = {
  en: {
    read:   '🔊 Read Lesson',
    stop:   '⏹ Stop Narration',
    replay: '🔁 Replay Lesson',
  },
  es: {
    read:   '🔊 Leer lección',
    stop:   '⏹ Detener audio',
    replay: '🔁 Repetir lección',
  },
};

export async function speakLesson(
  text: string,
  language: 'English' | 'Spanish',
  learnerType: 'kid' | 'student' | 'adult',
): Promise<Blob> {
  const res = await fetch('/api/speak', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, language, learnerType }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Speech synthesis failed');
  }

  return res.blob();
}

export function buildNarrationText(lesson: LessonResult): string {
  return [lesson.foodStory, lesson.learn, lesson.funFact].filter(Boolean).join('\n\n');
}

export default function VoiceLesson({
  food,
  learnerType,
  language,
  learningStyle,
  lang,
  externalLesson,
  initialTranscript,
  onLessonReady,
  onLoading,
  onError,
  autoSpeak = true,
}: VoiceLessonProps) {
  const [voiceState, setVoiceState] = useState<PushToTalkState>('idle');
  const [lastLesson, setLastLesson] = useState<LessonResult | null>(externalLesson ?? null);
  const [lastTranscript, setLastTranscript] = useState<string | null>(null);
  const initialRan = useRef(false);

  const audioRef     = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef  = useRef<string | null>(null);
  const isPlayingRef = useRef(false);

  const t = ui[lang];

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
    isPlayingRef.current = false;
    if (voiceState === 'speaking') setVoiceState('finished');
  }, [voiceState]);

  const playLesson = useCallback(async (lesson: LessonResult) => {
    stopPlayback();
    setVoiceState('speaking');

    try {
      const text = buildNarrationText(lesson);
      const blob = await speakLesson(text, language, learnerType);
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      isPlayingRef.current = true;

      audio.onended = () => {
        isPlayingRef.current = false;
        setVoiceState('finished');
      };
      audio.onerror = () => {
        isPlayingRef.current = false;
        setVoiceState('error');
      };

      await audio.play();
    } catch (err) {
      setVoiceState('error');
      onError(err instanceof Error ? err.message : 'Voice unavailable');
    }
  }, [language, learnerType, stopPlayback, onError]);

  const generateFromVoice = useCallback(async (transcript: string) => {
    onLoading();
    setVoiceState('processing');

    try {
      const res = await fetch('/api/generate-lesson', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food,
          learnerType,
          language,
          learningStyle,
          voiceTranscript: transcript,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lesson generation failed');

      const lesson = data.lesson as LessonResult;
      setLastLesson(lesson);
      setLastTranscript(transcript);

      onLessonReady(lesson, {
        redisConnected: data.memory?.redisConnected ?? false,
        transcript,
      });

      if (autoSpeak) {
        await playLesson(lesson);
      } else {
        setVoiceState('finished');
      }
    } catch (err) {
      setVoiceState('error');
      onError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }, [food, learnerType, language, learningStyle, autoSpeak, onLoading, onLessonReady, onError, playLesson]);

  useEffect(() => {
    if (externalLesson) setLastLesson(externalLesson);
  }, [externalLesson]);

  useEffect(() => {
    if (initialTranscript && !initialRan.current) {
      initialRan.current = true;
      setLastTranscript(initialTranscript);
      generateFromVoice(initialTranscript);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTranscript]);

  useEffect(() => {
    return () => { stopPlayback(); };
  }, [stopPlayback]);

  return (
    <div
      className="rounded-2xl p-4 space-y-3"
      style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe' }}
    >
      <PushToTalk
        language={language}
        state={voiceState}
        disabled={voiceState === 'processing'}
        onStateChange={setVoiceState}
        onTranscript={generateFromVoice}
        onError={(msg) => { onError(msg); setVoiceState('error'); }}
      />

      {lastTranscript && (
        <p className="text-xs text-violet-600 italic text-center px-2">
          &ldquo;{lastTranscript}&rdquo;
        </p>
      )}

      {lastLesson && (
        <div className="flex flex-wrap gap-2 justify-center pt-1">
          <button
            id="btn-read-lesson"
            type="button"
            onClick={() => playLesson(lastLesson)}
            disabled={voiceState === 'speaking'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }}
          >
            <Volume2 size={13} />
            {t.read}
          </button>

          <button
            id="btn-stop-narration"
            type="button"
            onClick={stopPlayback}
            disabled={voiceState !== 'speaking'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
          >
            <Square size={13} />
            {t.stop}
          </button>

          <button
            id="btn-replay-lesson"
            type="button"
            onClick={() => playLesson(lastLesson)}
            disabled={voiceState === 'speaking'}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #a7f3d0' }}
          >
            <RotateCcw size={13} />
            {t.replay}
          </button>
        </div>
      )}
    </div>
  );
}
