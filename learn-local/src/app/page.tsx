'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import HomeVoiceInput from '@/components/HomeVoiceInput';
import {
  FOOD_ITEMS,
  LEARNING_STYLES,
  STYLE_LABEL,
  toApiLanguage,
  saveProfileToRedis,
  VOICE_TRANSCRIPT_KEY,
  type AgeMode,
  type LangMode,
  type LearningStyle,
} from '@/lib/constants';
import { ChevronRight, Sparkles, ArrowLeft } from 'lucide-react';

const ageModes: { id: AgeMode; emoji: string; color: string; border: string; activeBg: string }[] = [
  { id: 'kid',     emoji: '🧒', color: 'text-pink-600',   border: 'border-pink-200',   activeBg: 'linear-gradient(145deg,#fff0f5,#ffd6e7)' },
  { id: 'student', emoji: '🎒', color: 'text-violet-600', border: 'border-violet-200', activeBg: 'linear-gradient(145deg,#f5f0ff,#e4d4ff)' },
  { id: 'adult',   emoji: '🧑', color: 'text-teal-600',   border: 'border-teal-200',   activeBg: 'linear-gradient(145deg,#f0fffe,#ccfbf1)' },
];

const languages: { id: LangMode; flag: string; label: string; native: string }[] = [
  { id: 'en', flag: '🇺🇸', label: 'English', native: 'English' },
  { id: 'es', flag: '🇲🇽', label: 'Spanish', native: 'Español' },
];

const copy = {
  en: {
    step0Title: 'Who is learning today?',
    step0Sub: 'We personalize every lesson to your learner type.',
    step1Title: 'Choose your language',
    step1Sub: 'Your lesson and voice will match this language.',
    step2Title: 'How do you like to learn?',
    step2Sub: 'Pick a style — story, visual, or quick facts.',
    step3Title: 'What food did you find today?',
    step3Sub: 'Tap a food or hold the mic to ask.',
    startBtn: 'Start My Lesson',
    loading: 'Starting your lesson…',
    back: 'Back',
    badge: 'Discover Your Food\'s Story',
    heroTitle: ['Every bite tells', 'a local story.'],
    heroSub: 'Learn where food comes from, understand its impact, and connect with your community — one lesson at a time. 🌾',
  },
  es: {
    step0Title: '¿Quién aprende hoy?',
    step0Sub: 'Personalizamos cada lección según tu tipo de aprendiz.',
    step1Title: 'Elige tu idioma',
    step1Sub: 'Tu lección y voz coincidirán con este idioma.',
    step2Title: '¿Cómo te gusta aprender?',
    step2Sub: 'Elige un estilo — historia, visual o datos rápidos.',
    step3Title: '¿Qué alimento encontraste hoy?',
    step3Sub: 'Toca un alimento o mantén el micrófono para preguntar.',
    startBtn: 'Comenzar mi lección',
    loading: 'Iniciando tu lección…',
    back: 'Atrás',
    badge: 'Descubre la historia de tu alimento',
    heroTitle: ['Cada bocado cuenta', 'una historia local.'],
    heroSub: 'Aprende de dónde viene la comida, entiende su impacto y conéctate con tu comunidad — una lección a la vez. 🌾',
  },
};

const ageLabelMap: Record<LangMode, Record<AgeMode, string>> = {
  en: { kid: 'Kid', student: 'Student', adult: 'Adult' },
  es: { kid: 'Niño/a', student: 'Estudiante', adult: 'Adulto/a' },
};

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

export default function HomePage() {
  const router = useRouter();

  const [step, setStep]               = useState<0 | 1 | 2 | 3>(0);
  const [ageMode, setAgeMode]         = useState<AgeMode | null>(null);
  const [lang, setLang]               = useState<LangMode>('en');
  const [learningStyle, setLearningStyle] = useState<LearningStyle>('story');
  const [food, setFood]               = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [voiceError, setVoiceError]   = useState('');

  const t = copy[lang];
  const apiLanguage = toApiLanguage(lang);

  const persistProfile = useCallback(async (style: LearningStyle) => {
    if (!ageMode) return;
    await saveProfileToRedis({
      learnerType:   ageMode,
      language:      apiLanguage,
      learningStyle: style,
    });
  }, [ageMode, apiLanguage]);

  function navigateToLesson(selectedFood: string, fromVoice = false, transcript?: string) {
    if (!ageMode) return;
    if (fromVoice && transcript) {
      sessionStorage.setItem(VOICE_TRANSCRIPT_KEY, transcript);
    }
    const params = new URLSearchParams({
      food: selectedFood,
      age: ageMode,
      lang,
      style: learningStyle,
      ...(fromVoice ? { fromVoice: '1' } : {}),
    });
    router.push(`/lesson?${params.toString()}`);
  }

  function handleLearn() {
    if (!food || !ageMode) return;
    setLoading(true);
    persistProfile(learningStyle);
    setTimeout(() => navigateToLesson(food), 600);
  }

  function handleVoiceFood(foodId: string, transcript: string) {
    if (!ageMode) return;
    setFood(foodId);
    setVoiceError('');
    setLoading(true);
    persistProfile(learningStyle);
    setTimeout(() => navigateToLesson(foodId, true, transcript), 600);
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#fffbf5 0%,#fff7ed 50%,#fef3c7 100%)' }}>
      <NavBar />

      <section className="max-w-2xl mx-auto px-4 pt-10 pb-4 text-center">
        <div
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold mb-4"
          style={{ background: '#fff3e0', border: '1px solid #fed7aa', color: '#c2410c' }}
        >
          <Sparkles size={14} />
          {t.badge}
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 leading-tight mb-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {t.heroTitle[0]}
          <br />
          <span className="gradient-text">{t.heroTitle[1]}</span>
        </h1>
        <p className="text-stone-500 text-base leading-relaxed max-w-lg mx-auto">{t.heroSub}</p>
      </section>

      <section className="max-w-xl mx-auto px-4 pb-16">
        <div
          className="bg-white rounded-3xl shadow-2xl border border-orange-100 p-6 sm:p-8"
          style={{ boxShadow: '0 24px 64px rgba(249,115,22,0.12)' }}
        >
          <StepDots current={step} total={4} />

          {/* STEP 0 — Learner type */}
          {step === 0 && (
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 text-center mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {t.step0Title}
              </h2>
              <p className="text-stone-400 text-sm text-center mb-6">{t.step0Sub}</p>
              <div className="grid grid-cols-3 gap-4">
                {ageModes.map((m) => (
                  <button
                    key={m.id}
                    id={`age-mode-${m.id}`}
                    onClick={() => { setAgeMode(m.id); setStep(1); }}
                    className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer group hover:scale-105 hover:shadow-lg"
                    style={{ borderColor: '#e7e5e4', background: '#fafaf9' }}
                  >
                    <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">{m.emoji}</span>
                    <span className={`text-sm font-bold ${m.color}`}>{ageLabelMap[lang][m.id]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 — Language */}
          {step === 1 && (
            <div>
              <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-stone-400 hover:text-orange-500 transition-colors mb-5 font-semibold">
                <ArrowLeft size={15} /> {t.back}
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 text-center mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.step1Title}</h2>
              <p className="text-stone-400 text-sm text-center mb-6">{t.step1Sub}</p>
              <div className="grid grid-cols-2 gap-4">
                {languages.map((l) => (
                  <button
                    key={l.id}
                    id={`lang-${l.id}`}
                    onClick={() => { setLang(l.id); setStep(2); }}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer hover:scale-105 hover:shadow-lg"
                    style={{ borderColor: '#e7e5e4', background: '#fafaf9' }}
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

          {/* STEP 2 — Learning style */}
          {step === 2 && (
            <div>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-stone-400 hover:text-orange-500 transition-colors mb-5 font-semibold">
                <ArrowLeft size={15} /> {t.back}
              </button>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 text-center mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.step2Title}</h2>
              <p className="text-stone-400 text-sm text-center mb-6">{t.step2Sub}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LEARNING_STYLES.map((s) => {
                  const selected = learningStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      id={`style-${s.id}`}
                      onClick={() => {
                        setLearningStyle(s.id);
                        persistProfile(s.id);
                        setStep(3);
                      }}
                      className="flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all duration-200"
                      style={{
                        borderColor: selected ? '#f97316' : '#e7e5e4',
                        background: selected ? '#fff7ed' : '#fafaf9',
                      }}
                    >
                      <span className="text-3xl">{s.emoji}</span>
                      <span className="text-sm font-bold text-stone-800">{lang === 'es' ? s.es : s.en}</span>
                      <span className="text-xs text-stone-400 text-center">{lang === 'es' ? s.esDesc : s.enDesc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3 — Food + Voice */}
          {step === 3 && ageMode && (
            <div>
              <button onClick={() => { setStep(2); setFood(null); }} className="flex items-center gap-1 text-sm text-stone-400 hover:text-orange-500 transition-colors mb-5 font-semibold">
                <ArrowLeft size={15} /> {t.back}
              </button>

              <div className="flex items-center justify-center gap-2 flex-wrap mb-5">
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#fff0f5', color: '#be185d', border: '1px solid #fecdd3' }}>
                  {ageModes.find((m) => m.id === ageMode)?.emoji} {ageLabelMap[lang][ageMode]}
                </span>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                  {languages.find((l) => l.id === lang)?.flag} {languages.find((l) => l.id === lang)?.label}
                </span>
                <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
                  {STYLE_LABEL[learningStyle][lang]}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-stone-800 text-center mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>{t.step3Title}</h2>
              <p className="text-stone-400 text-sm text-center mb-6">{t.step3Sub}</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {FOOD_ITEMS.map((item) => {
                  const isSelected = food === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`food-select-${item.id}`}
                      onClick={() => setFood(item.id)}
                      className="relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200"
                      style={{
                        borderColor: isSelected ? item.accent : '#e7e5e4',
                        background: isSelected ? item.lightBg : '#fafaf9',
                        transform: isSelected ? 'scale(1.03)' : undefined,
                      }}
                    >
                      <span className="text-3xl">{item.emoji}</span>
                      <span className="text-xs font-bold" style={{ color: isSelected ? item.accent : '#57534e' }}>
                        {lang === 'es' ? item.es : item.en}
                      </span>
                    </button>
                  );
                })}
              </div>

              <HomeVoiceInput
                language={apiLanguage}
                lang={lang}
                fallbackFood={food ?? 'strawberry'}
                disabled={loading}
                onFoodDetected={handleVoiceFood}
                onError={(msg) => setVoiceError(msg)}
              />

              {voiceError && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3 text-center">
                  ⚠️ {voiceError}
                </p>
              )}

              <button
                id="btn-learn-now"
                onClick={handleLearn}
                disabled={!food || loading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-200 mt-4"
                style={
                  food && !loading
                    ? { background: 'linear-gradient(90deg,#f97316,#f43f5e)', color: '#fff', boxShadow: '0 8px 24px rgba(249,115,22,0.35)' }
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

              <p className="text-center text-xs text-stone-400 mt-4">🔒 No account needed · 100% free · Kid-safe</p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-stone-500 mt-8 font-medium italic">
          {lang === 'es' ? 'Aprendiendo un alimento a la vez.' : 'Learning one food at a time.'}
        </p>
      </section>
    </div>
  );
}
