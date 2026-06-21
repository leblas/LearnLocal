'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import { ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type AgeMode = 'kid' | 'student' | 'adult';
type LangMode = 'en' | 'es';

// ─── Static Data ─────────────────────────────────────────────────────────────
const ageModes: { id: AgeMode; emoji: string; label: string; sublabel: string; color: string; bg: string; border: string; activeBg: string }[] = [
  {
    id: 'kid',
    emoji: '🧒',
    label: 'Kid',
    sublabel: 'Ages 5–10',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    activeBg: 'linear-gradient(145deg,#fff0f5,#ffd6e7)',
  },
  {
    id: 'student',
    emoji: '🎒',
    label: 'Student',
    sublabel: 'Ages 11–18',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    activeBg: 'linear-gradient(145deg,#f5f0ff,#e4d4ff)',
  },
  {
    id: 'adult',
    emoji: '🧑',
    label: 'Adult',
    sublabel: '18 +',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    activeBg: 'linear-gradient(145deg,#f0fffe,#ccfbf1)',
  },
];

const languages: { id: LangMode; flag: string; label: string; native: string }[] = [
  { id: 'en', flag: '🇺🇸', label: 'English', native: 'English' },
  { id: 'es', flag: '🇲🇽', label: 'Spanish', native: 'Español' },
];

const foodItems = [
  { id: 'strawberry', emoji: '🍓', en: 'Strawberry', es: 'Fresa',       accent: '#e11d48', lightBg: '#fff1f2', border: '#fecdd3' },
  { id: 'apple',      emoji: '🍎', en: 'Apple',      es: 'Manzana',     accent: '#dc2626', lightBg: '#fef2f2', border: '#fecaca' },
  { id: 'tomato',     emoji: '🍅', en: 'Tomato',     es: 'Jitomate',    accent: '#ea580c', lightBg: '#fff7ed', border: '#fed7aa' },
];

// ─── Copy maps ───────────────────────────────────────────────────────────────
const copy = {
  en: {
    step1Title: 'How do you like to learn?',
    step1Sub: 'Choose your learning style so we can personalise your lesson.',
    step2Title: 'Choose your language',
    step2Sub: 'Your lesson will be delivered in the language you pick.',
    step3Title: 'What food did you find today?',
    step3Sub: 'Tap a food to start your personalised lesson.',
    startBtn: 'Start My Lesson',
    loading: 'Loading lesson…',
    back: 'Back',
    badge: 'Discover Your Food\'s Story',
    heroTitle: ['Every bite tells', 'a local story.'],
    heroSub: 'Select your age mode, language, and a food item to uncover where it came from and how it supports your community. 🌾',
  },
  es: {
    step1Title: '¿Cómo te gusta aprender?',
    step1Sub: 'Elige tu estilo de aprendizaje para personalizar tu lección.',
    step2Title: 'Elige tu idioma',
    step2Sub: 'Tu lección será en el idioma que elijas.',
    step3Title: '¿Qué alimento encontraste hoy?',
    step3Sub: 'Toca un alimento para comenzar tu lección personalizada.',
    startBtn: 'Comenzar mi lección',
    loading: 'Cargando lección…',
    back: 'Atrás',
    badge: 'Descubre la historia de tu alimento',
    heroTitle: ['Cada bocado cuenta', 'una historia local.'],
    heroSub: 'Selecciona tu modo de edad, idioma y un alimento para descubrir de dónde vino y cómo apoya a tu comunidad. 🌾',
  },
};

const ageLabelMap: Record<LangMode, Record<AgeMode, string>> = {
  en: { kid: 'Kid', student: 'Student', adult: 'Adult' },
  es: { kid: 'Niño/a', student: 'Estudiante', adult: 'Adulto/a' },
};

const ageSublabelMap: Record<LangMode, Record<AgeMode, string>> = {
  en: { kid: 'Ages 5–10', student: 'Ages 11–18', adult: '18+' },
  es: { kid: 'Edades 5–10', student: 'Edades 11–18', adult: '18+' },
};

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 24 : 8,
            height: 8,
            borderRadius: 4,
            background: i === current
              ? 'linear-gradient(90deg,#f97316,#f43f5e)'
              : i < current ? '#fb923c' : '#e7e5e4',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();

  const [step, setStep]       = useState<0 | 1 | 2>(0);   // 0=age, 1=lang, 2=food
  const [ageMode, setAgeMode] = useState<AgeMode | null>(null);
  const [lang, setLang]       = useState<LangMode>('en');
  const [food, setFood]       = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const t = copy[lang];

  function goStep2(mode: AgeMode) {
    setAgeMode(mode);
    setStep(1);
  }

  function goStep3(l: LangMode) {
    setLang(l);
    setStep(2);
  }

  function handleLearn() {
    if (!food || !ageMode) return;
    setLoading(true);
    setTimeout(() => {
      router.push(`/lesson?food=${food}&age=${ageMode}&lang=${lang}`);
    }, 1200);
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#fffbf5 0%,#fff7ed 50%,#fef3c7 100%)' }}>
      <NavBar />

      {/* ── Hero ── */}
      <section className="max-w-2xl mx-auto px-4 pt-10 pb-4 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
          style={{ background: '#fff3e0', border: '1px solid #fed7aa', color: '#c2410c' }}
        >
          <Sparkles size={14} />
          {t.badge}
        </div>
        <h1
          className="text-4xl sm:text-5xl font-bold text-stone-900 leading-tight mb-3"
          style={{ fontFamily: 'Outfit, sans-serif' }}
        >
          {t.heroTitle[0]}
          <br />
          <span className="gradient-text">{t.heroTitle[1]}</span>
        </h1>
        <p className="text-stone-500 text-base leading-relaxed max-w-lg mx-auto">
          {t.heroSub}
        </p>
      </section>

      {/* ── Main Card ── */}
      <section className="max-w-xl mx-auto px-4 pb-16">
        <div
          className="bg-white rounded-3xl shadow-2xl border border-orange-100 p-6 sm:p-8"
          style={{ boxShadow: '0 24px 64px rgba(249,115,22,0.12)' }}
        >
          <StepDots current={step} total={3} />

          {/* ────────────────── STEP 0 — Age/Mode ────────────────── */}
          {step === 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 text-center mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {t.step1Title}
              </h2>
              <p className="text-stone-400 text-sm text-center mb-6">{t.step1Sub}</p>

              <div className="grid grid-cols-3 gap-4">
                {ageModes.map((m) => (
                  <button
                    key={m.id}
                    id={`age-mode-${m.id}`}
                    onClick={() => goStep2(m.id)}
                    className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-lg"
                    style={{ borderColor: m.border.replace('border-',''), background: '#fafaf9' }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = m.activeBg;
                      (e.currentTarget as HTMLButtonElement).style.borderColor = m.border.replace('border-','');
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#fafaf9';
                    }}
                  >
                    <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-200">
                      {m.emoji}
                    </span>
                    <span className={`text-sm font-bold ${m.color}`}>
                      {ageLabelMap[lang][m.id]}
                    </span>
                    <span className="text-xs text-stone-400 font-medium">
                      {ageSublabelMap[lang][m.id]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────── STEP 1 — Language ────────────────── */}
          {step === 1 && (
            <div>
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-1 text-sm text-stone-400 hover:text-orange-500 transition-colors mb-5 font-semibold"
              >
                <ArrowLeft size={15} /> {copy[lang].back}
              </button>

              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 text-center mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {t.step2Title}
              </h2>
              <p className="text-stone-400 text-sm text-center mb-6">{t.step2Sub}</p>

              <div className="grid grid-cols-2 gap-4">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    id={`lang-${l.id}`}
                    onClick={() => goStep3(l.id)}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg"
                    style={{
                      borderColor: lang === l.id ? '#f97316' : '#e7e5e4',
                      background: lang === l.id ? 'linear-gradient(145deg,#fff7f0,#ffe4d5)' : '#fafaf9',
                    }}
                  >
                    <span className="text-5xl">{l.flag}</span>
                    <div className="text-center">
                      <div className="font-bold text-stone-800 text-base">{l.label}</div>
                      <div className="text-stone-400 text-sm font-medium">{l.native}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────── STEP 2 — Food ────────────────── */}
          {step === 2 && (
            <div>
              <button
                onClick={() => { setStep(1); setFood(null); }}
                className="flex items-center gap-1 text-sm text-stone-400 hover:text-orange-500 transition-colors mb-5 font-semibold"
              >
                <ArrowLeft size={15} /> {t.back}
              </button>

              {/* Pills showing selections */}
              <div className="flex items-center justify-center gap-2 flex-wrap mb-5">
                {ageMode && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#fff0f5', color: '#be185d', border: '1px solid #fecdd3' }}>
                    {ageModes.find(m => m.id === ageMode)?.emoji} {ageLabelMap[lang][ageMode]}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                  {languages.find(l => l.id === lang)?.flag} {languages.find(l => l.id === lang)?.label}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 text-center mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {t.step3Title}
              </h2>
              <p className="text-stone-400 text-sm text-center mb-6">{t.step3Sub}</p>

              {/* Food Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {foodItems.map((item) => {
                  const isSelected = food === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`food-select-${item.id}`}
                      onClick={() => setFood(item.id)}
                      className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 cursor-pointer group"
                      style={{
                        borderColor: isSelected ? item.accent : '#e7e5e4',
                        background: isSelected ? item.lightBg : '#fafaf9',
                        boxShadow: isSelected ? `0 8px 24px ${item.accent}30` : undefined,
                        transform: isSelected ? 'scale(1.05)' : undefined,
                      }}
                    >
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-200">
                        {item.emoji}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: isSelected ? item.accent : '#57534e' }}
                      >
                        {lang === 'es' ? item.es : item.en}
                      </span>
                      {isSelected && (
                        <div
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md text-white text-xs"
                          style={{ background: item.accent }}
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Start Button */}
              <button
                id="btn-learn-now"
                onClick={handleLearn}
                disabled={!food || loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-200"
                style={
                  food && !loading
                    ? {
                        background: 'linear-gradient(90deg,#f97316,#f43f5e)',
                        color: '#fff',
                        boxShadow: '0 8px 24px rgba(249,115,22,0.35)',
                      }
                    : { background: '#f5f5f4', color: '#a8a29e', cursor: 'not-allowed' }
                }
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {t.loading}
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    {t.startBtn}
                    <ChevronRight size={18} />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-stone-400 mt-4">
                🔒 No account needed · 100% free · Kid-safe
              </p>
            </div>
          )}
        </div>

        {/* ── How it works ── */}
        <div className="mt-10">
          <h2
            className="text-xl font-bold text-center text-stone-700 mb-5"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {lang === 'es' ? 'Cómo funciona LearnLocal' : 'How LearnLocal works'}
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {(lang === 'es'
              ? [
                  { step: '1', icon: '🎯', title: 'Elige tu modo', desc: 'Selecciona tu grupo de edad, idioma y un alimento para empezar.' },
                  { step: '2', icon: '📖', title: 'Explora la historia', desc: 'Descubre el origen de tu alimento, su impacto ambiental y cómo apoya a tu comunidad.' },
                  { step: '3', icon: '🏆', title: 'Actúa y gana', desc: 'Completa una acción local, gana XP y sube en la tabla de clasificación.' },
                ]
              : [
                  { step: '1', icon: '🎯', title: 'Pick Your Mode', desc: 'Select your age group, language, and a food item to get started.' },
                  { step: '2', icon: '📖', title: 'Explore the Story', desc: 'Read where your food came from, its eco impact, and how it supports your community.' },
                  { step: '3', icon: '🏆', title: 'Take Action & Earn', desc: 'Complete a local action, earn XP points, and climb the community leaderboard!' },
                ]
            ).map(({ step, icon, title, desc }) => (
              <div key={step} className="relative bg-white rounded-2xl p-5 shadow-md border border-orange-50 card-lift">
                <div
                  className="absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                  style={{ background: 'linear-gradient(135deg,#f97316,#f43f5e)' }}
                >
                  {step}
                </div>
                <div className="text-3xl mb-3">{icon}</div>
                <h3 className="font-bold text-stone-800 mb-1.5" style={{ fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
