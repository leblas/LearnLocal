'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import VoiceLesson, { type LessonResult } from '@/components/VoiceLesson';
import { VOICE_TRANSCRIPT_KEY, type LearningStyle } from '@/lib/constants';
import {
  ArrowLeft, RefreshCw, MapPin, Leaf, Users, Zap, Star,
  ChevronRight, BookOpen, Sparkles,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
type Status      = 'idle' | 'loading' | 'success' | 'error';
type SaveStatus  = 'idle' | 'saving'  | 'saved'   | 'failed';

// ── Static maps ───────────────────────────────────────────────────────────────
const foodMeta: Record<string, { emoji: string; label: string; esLabel: string; accent: string; lightBg: string }> = {
  strawberry: { emoji: '🍓', label: 'Strawberry', esLabel: 'Fresa',    accent: '#e11d48', lightBg: '#fff1f2' },
  apple:      { emoji: '🍎', label: 'Apple',      esLabel: 'Manzana',  accent: '#dc2626', lightBg: '#fef2f2' },
  tomato:     { emoji: '🍅', label: 'Tomato',     esLabel: 'Jitomate', accent: '#ea580c', lightBg: '#fff7ed' },
  lettuce:    { emoji: '🥬', label: 'Lettuce',    esLabel: 'Lechuga',  accent: '#16a34a', lightBg: '#f0fdf4' },
};

const ageMeta: Record<string, { emoji: string; en: string; es: string }> = {
  kid:     { emoji: '🧒', en: 'Kid',      es: 'Niño/a'     },
  student: { emoji: '🎒', en: 'Student',  es: 'Estudiante' },
  adult:   { emoji: '🧑', en: 'Adult',    es: 'Adulto/a'   },
};

const langMeta: Record<string, { flag: string; label: string }> = {
  en: { flag: '🇺🇸', label: 'English' },
  es: { flag: '🇲🇽', label: 'Español' },
};

const cards = [
  {
    key: 'foodStory' as const,
    icon: MapPin,
    color: '#f97316',
    bg: '#fff7ed',
    border: '#fed7aa',
    en: { title: 'Food Story',   sub: 'Where it comes from'           },
    es: { title: 'Historia',     sub: 'De dónde viene'                },
  },
  {
    key: 'learn' as const,
    icon: BookOpen,
    color: '#8b5cf6',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    en: { title: 'Learn',        sub: 'Key concept'                   },
    es: { title: 'Aprende',      sub: 'Concepto clave'                },
  },
  {
    key: 'impact' as const,
    icon: Leaf,
    color: '#10b981',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    en: { title: 'Impact',       sub: 'Environmental & community'     },
    es: { title: 'Impacto',      sub: 'Medio ambiente y comunidad'    },
  },
  {
    key: 'takeAction' as const,
    icon: Zap,
    color: '#f59e0b',
    bg: '#fffbeb',
    border: '#fde68a',
    en: { title: 'Take Action',  sub: 'Something you can do today'   },
    es: { title: 'Actúa',        sub: 'Algo que puedes hacer hoy'    },
  },
  {
    key: 'funFact' as const,
    icon: Star,
    color: '#ec4899',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    en: { title: 'Fun Fact',     sub: 'Did you know?'                 },
    es: { title: 'Dato curioso', sub: '¿Sabías que…?'                 },
  },
];

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-5"
          style={{ background: '#f5f5f4', border: '1px solid #e7e5e4' }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-stone-200" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 rounded bg-stone-200" />
              <div className="h-2.5 w-16 rounded bg-stone-100" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-stone-200" />
            <div className="h-3 w-5/6 rounded bg-stone-200" />
            <div className="h-3 w-4/6 rounded bg-stone-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Lesson card ───────────────────────────────────────────────────────────────
function LessonCard({
  cardDef,
  text,
  lang,
  visible,
  delay,
}: {
  cardDef: typeof cards[number];
  text: string;
  lang: string;
  visible: boolean;
  delay: number;
}) {
  const { icon: Icon, color, bg, border } = cardDef;
  const lbl = lang === 'es' ? cardDef.es : cardDef.en;

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-500"
      style={{
        background: bg,
        border: `1.5px solid ${border}`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}18` }}
        >
          <Icon size={18} style={{ color }} />
        </div>
        <div>
          <p className="text-sm font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {lbl.title}
          </p>
          <p className="text-xs text-stone-400">{lbl.sub}</p>
        </div>
      </div>
      <p className="text-sm text-stone-700 leading-relaxed">{text}</p>
    </div>
  );
}

// ── Main lesson content ───────────────────────────────────────────────────────
function LessonContent() {
  const searchParams = useSearchParams();
  const food        = searchParams.get('food')  || 'strawberry';
  const ageMode     = searchParams.get('age')   || 'student';
  const lang        = searchParams.get('lang')  || 'en';
  const style       = (searchParams.get('style') || 'story') as LearningStyle;
  const fromVoice   = searchParams.get('fromVoice') === '1';

  const [status,     setStatus]     = useState<Status>(fromVoice ? 'loading' : 'idle');
  const [lesson,     setLesson]     = useState<LessonResult | null>(null);
  const [errMsg,     setErrMsg]     = useState('');
  const [visible,    setVisible]    = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [voiceReady, setVoiceReady] = useState(!fromVoice);

  const meta  = foodMeta[food]  ?? foodMeta.strawberry;
  const aMeta = ageMeta[ageMode] ?? ageMeta.student;
  const lMeta = langMeta[lang]  ?? langMeta.en;

  const learnerLabel = lang === 'es' ? aMeta.es : aMeta.en;
  const foodLabel    = lang === 'es' ? meta.esLabel : meta.label;
  const language     = lang === 'es' ? 'Spanish' : 'English';
  const learningStyle = style === 'quick' ? 'quick' : style;

  useEffect(() => {
    if (!fromVoice) return;
    const t = sessionStorage.getItem(VOICE_TRANSCRIPT_KEY);
    if (t) {
      setVoiceTranscript(t);
      sessionStorage.removeItem(VOICE_TRANSCRIPT_KEY);
    }
    setVoiceReady(true);
  }, [fromVoice]);

  useEffect(() => {
    fetch('/api/save-profile', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        learnerType:   ageMode,
        language,
        learningStyle,
      }),
    }).catch(() => { /* non-fatal */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateLesson = useCallback(async (transcript?: string) => {
    setStatus('loading');
    setSaveStatus('saving');
    if (!transcript) {
      setLesson(null);
      setVisible(false);
    }
    setErrMsg('');

    try {
      const res = await fetch('/api/generate-lesson', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          food,
          learnerType:   ageMode,
          language,
          learningStyle,
          ...(transcript ? { voiceTranscript: transcript } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server error ${res.status}`);
      }

      const { lesson: lessonData, memory } = data as {
        lesson: LessonResult;
        memory?: { redisConnected?: boolean };
      };

      setLesson(lessonData);
      setStatus('success');
      setSaveStatus(memory?.redisConnected ? 'saved' : 'failed');
      setTimeout(() => setVisible(true), 80);
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : 'Something went wrong.');
      setStatus('error');
      setSaveStatus('idle');
    }
  }, [food, ageMode, language, learningStyle]);

  useEffect(() => {
    if (!voiceReady) return;
    if (fromVoice && voiceTranscript) return;
    generateLesson();
  }, [voiceReady, fromVoice, voiceTranscript, generateLesson]);

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 pb-16 space-y-5">
      {/* Back */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-orange-500 transition-colors"
      >
        <ArrowLeft size={15} />
        {lang === 'es' ? 'Volver al inicio' : 'Back to home'}
      </Link>

      {/* Header card */}
      <div
        className="relative overflow-hidden rounded-3xl p-6"
        style={{
          background: `linear-gradient(135deg, ${meta.lightBg}, #fff7ed)`,
          border: `1.5px solid ${meta.accent}30`,
          boxShadow: `0 12px 40px ${meta.accent}18`,
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10"
          style={{ background: meta.accent, transform: 'translate(30%, -30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-10"
          style={{ background: meta.accent, transform: 'translate(-30%, 30%)' }}
        />

        <div className="relative flex items-start gap-4">
          <div className="text-5xl">{meta.emoji}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: `${meta.accent}18`, color: meta.accent }}
              >
                <Sparkles size={10} className="inline mr-1" />
                {lang === 'es' ? 'Lección IA' : 'AI Lesson'}
              </span>
            </div>

            <h1
              className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {foodLabel}
            </h1>

            <div className="flex items-center gap-2 flex-wrap mt-2">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#fff0f5', color: '#be185d', border: '1px solid #fecdd3' }}
              >
                {aMeta.emoji} {learnerLabel}
              </span>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}
              >
                {lMeta.flag} {lMeta.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Voice: Push-to-Talk ── */}
      <VoiceLesson
        food={food}
        learnerType={ageMode as 'kid' | 'student' | 'adult'}
        language={language}
        learningStyle={learningStyle}
        lang={lang as 'en' | 'es'}
        externalLesson={lesson}
        initialTranscript={fromVoice ? voiceTranscript : null}
        autoSpeak={fromVoice || !!voiceTranscript}
        onLoading={() => {
          setStatus('loading');
          setVisible(false);
          setErrMsg('');
        }}
        onLessonReady={(lessonData, meta) => {
          setLesson(lessonData);
          setStatus('success');
          setSaveStatus(meta.redisConnected ? 'saved' : 'failed');
          setTimeout(() => setVisible(true), 80);
        }}
        onError={(msg) => {
          setErrMsg(msg);
          if (status !== 'success') setStatus('error');
        }}
      />

      {/* ── Loading ── */}
      {status === 'loading' && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}
            >
              <div className="w-3.5 h-3.5 border-2 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
              {lang === 'es' ? 'Personalizando tu lección…' : 'Personalizing your lesson…'}
            </div>
          </div>
          <LoadingSkeleton />
        </div>
      )}

      {/* ── Error ── */}
      {status === 'error' && (
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{ background: '#fef2f2', border: '1.5px solid #fecaca' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚠️</span>
            <p className="font-bold text-red-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {lang === 'es' ? 'Error al generar la lección' : 'Could not generate lesson'}
            </p>
          </div>
          <p className="text-sm text-red-600 font-mono bg-red-50 rounded-xl px-3 py-2">{errMsg}</p>
          <button
            id="btn-retry"
            onClick={() => generateLesson()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-95"
            style={{ background: '#dc2626' }}
          >
            <RefreshCw size={15} />
            {lang === 'es' ? 'Reintentar' : 'Try Again'}
          </button>
        </div>
      )}

      {/* ── Success: lesson cards ── */}
      {status === 'success' && lesson && (
        <>
          <div className="space-y-4">
            {cards.map((card, i) => (
              <LessonCard
                key={card.key}
                cardDef={card}
                text={lesson[card.key]}
                lang={lang}
                visible={visible}
                delay={i * 80}
              />
            ))}
          </div>

          {/* Redis memory status banner */}
          {saveStatus === 'saved' && (
            <div
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold"
              style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0', color: '#15803d' }}
            >
              <span>✅</span>
              {lang === 'es' ? 'Lección guardada en tu camino' : 'Lesson saved to your journey'}
            </div>
          )}
          {saveStatus === 'failed' && (
            <div
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm font-semibold"
              style={{ background: '#fefce8', border: '1.5px solid #fde68a', color: '#92400e' }}
            >
              <span>⚠️</span>
              {lang === 'es' ? 'No se pudo guardar el progreso' : 'Could not save progress'}
            </div>
          )}

          {/* Action row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="btn-regenerate"
              onClick={() => generateLesson()}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
              style={{
                background: 'white',
                border: '2px solid #e7e5e4',
                color: '#57534e',
              }}
            >
              <RefreshCw size={16} />
              {lang === 'es' ? 'Regenerar lección' : 'Regenerate Lesson'}
            </button>

            <Link
              href="/progress"
              id="btn-journey"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{
                background: 'linear-gradient(90deg,#8b5cf6,#6366f1)',
                boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
              }}
            >
              {lang === 'es' ? 'Ver mi camino' : 'View My Journey'}
              <ChevronRight size={16} />
            </Link>

            <Link
              href="/"
              id="btn-new-food"
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{
                background: 'linear-gradient(90deg,#f97316,#f43f5e)',
                boxShadow: '0 8px 24px rgba(249,115,22,0.3)',
              }}
            >
              {lang === 'es' ? 'Explorar otro alimento' : 'Explore Another Food'}
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Community nudge */}
          <div
            className="rounded-2xl p-4 flex items-center gap-3 text-sm"
            style={{ background: '#f0fdf4', border: '1.5px solid #a7f3d0' }}
          >
            <Users size={18} className="text-emerald-500 flex-shrink-0" />
            <p className="text-emerald-700 font-medium">
              {lang === 'es'
                ? '¡Comparte tu lección con la comunidad y gana XP extra!'
                : 'Share this lesson with your community and earn bonus XP!'}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ── Page wrapper (Suspense for useSearchParams) ───────────────────────────────
export default function LessonPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg,#fffbf5 0%,#fff7ed 60%,#fef3c7 100%)' }}
    >
      <NavBar />
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-3">
              <div className="text-5xl float-anim">🌱</div>
              <p className="text-stone-500 font-semibold">Loading…</p>
            </div>
          </div>
        }
      >
        <LessonContent />
      </Suspense>
    </div>
  );
}
