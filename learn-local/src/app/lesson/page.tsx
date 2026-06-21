'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { foodDatabase } from '@/lib/data';
import {
  MapPin, Leaf, Users, Zap, ArrowLeft, Star, Award,
  Droplets, Calendar, CheckCircle2, ChevronRight, Info
} from 'lucide-react';

function CarbonMeter({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444';
  const label = score >= 7 ? 'Excellent' : score >= 4 ? 'Good' : 'Needs Work';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-stone-600">Eco Score</span>
        <span className="font-bold" style={{ color }}>{label} · {score}/10</span>
      </div>
      <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}88, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

function LessonContent({ foodId }: { foodId: string }) {
  const router = useRouter();
  const lesson = foodDatabase[foodId];

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div className="text-6xl">🤔</div>
        <h2 className="text-xl font-bold text-stone-700">Food not found</h2>
        <p className="text-stone-500">We don't have data for that food yet!</p>
        <Link href="/" className="text-orange-500 font-semibold hover:underline flex items-center gap-1">
          <ArrowLeft size={16} /> Go back home
        </Link>
      </div>
    );
  }

  const difficultyColors: Record<string, string> = {
    Easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Medium: 'bg-amber-100 text-amber-700 border-amber-200',
    Adventure: 'bg-purple-100 text-purple-700 border-purple-200',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-16 space-y-6">
      {/* Back + Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-orange-500 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <span className="text-stone-300">·</span>
        <span className="text-sm text-stone-400">Lesson Result</span>
      </div>

      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{ background: 'linear-gradient(135deg, #fff7ed, #fef3c7)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-orange-400 translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-rose-400 -translate-x-1/3 translate-y-1/3" />
        </div>
        <div className="relative p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Food emoji + Image */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/strawberry.png"
                alt={lesson.name}
                width={112}
                height={112}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md text-2xl">
              {lesson.emoji}
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">New Lesson!</span>
              {lesson.badges.map((badge) => (
                <span key={badge} className="bg-white/70 backdrop-blur text-stone-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-stone-200 flex items-center gap-1">
                  <Award size={10} className="text-amber-500" />
                  {badge}
                </span>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {lesson.name}
            </h1>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <MapPin size={14} className="text-orange-500" />
              <span className="font-semibold">{lesson.origin.farmName}</span>
              <span className="text-stone-400">·</span>
              <span className="text-orange-600 font-medium">{lesson.origin.distance}</span>
            </div>
            <div className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              {lesson.origin.travelTime}
            </div>
          </div>

          {/* XP Reward Pill */}
          <div className="flex-shrink-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-center text-white shadow-lg">
            <Star size={20} className="mx-auto mb-1 fill-white" />
            <div className="text-2xl font-bold">+75</div>
            <div className="text-xs font-medium opacity-90">XP Earned</div>
          </div>
        </div>
      </div>

      {/* Section 1: Origin Story */}
      <section className="bg-white rounded-2xl shadow-md border border-orange-50 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-orange-50">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
            <MapPin size={18} className="text-orange-500" />
          </div>
          <div>
            <h2 className="font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Where It Came From</h2>
            <p className="text-xs text-stone-400">{lesson.origin.region} · {lesson.origin.country}</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-stone-600 leading-relaxed text-sm sm:text-base">{lesson.origin.story}</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Farm', value: lesson.origin.farmName, icon: '🌾' },
              { label: 'Distance', value: lesson.origin.distance, icon: '📍' },
              { label: 'Harvest', value: lesson.origin.travelTime, icon: '⏰' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-orange-50 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-xs text-stone-500 mb-0.5">{label}</div>
                <div className="text-xs font-bold text-stone-700 leading-tight">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Environmental Impact */}
      <section className="bg-white rounded-2xl shadow-md border border-emerald-50 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-emerald-50">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Leaf size={18} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Environmental Impact</h2>
            <p className="text-xs text-stone-400">How this choice affects our planet</p>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <CarbonMeter score={lesson.environmental.carbonScore} />
          <p className="text-stone-600 leading-relaxed text-sm sm:text-base">{lesson.environmental.impact}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-start gap-2.5 bg-blue-50 rounded-xl p-3">
              <Droplets size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-blue-700">Water Usage</div>
                <div className="text-xs text-blue-600 mt-0.5">{lesson.environmental.waterUsage}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-amber-50 rounded-xl p-3">
              <Calendar size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-amber-700">Best Season</div>
                <div className="text-xs text-amber-600 mt-0.5">{lesson.environmental.seasonality}</div>
              </div>
            </div>
            <div className="flex items-start gap-2.5 bg-emerald-50 rounded-xl p-3">
              <Leaf size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-700">Pesticides</div>
                <div className="text-xs text-emerald-600 mt-0.5">{lesson.environmental.pesticides}</div>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Info size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-amber-800">{lesson.environmental.tip}</p>
          </div>
        </div>
      </section>

      {/* Section 3: Community Impact */}
      <section className="bg-white rounded-2xl shadow-md border border-blue-50 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-blue-50">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Users size={18} className="text-blue-500" />
          </div>
          <div>
            <h2 className="font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Community Impact</h2>
            <p className="text-xs text-stone-400">How your purchase shapes your neighborhood</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-stone-600 leading-relaxed text-sm sm:text-base">{lesson.community.story}</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{lesson.community.jobs}</div>
              <div className="text-xs text-blue-500 mt-0.5">Local Jobs</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-orange-700">{lesson.community.familyFarms}</div>
              <div className="text-xs text-orange-500 mt-0.5">Family Farms</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-emerald-700">{lesson.community.localEconomy}</div>
              <div className="text-xs text-emerald-500 mt-0.5">Local Revenue/yr</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: Fun Facts */}
      <section className="bg-white rounded-2xl shadow-md border border-purple-50 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-purple-50">
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
            <span className="text-lg">🧠</span>
          </div>
          <h2 className="font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Fun Facts</h2>
        </div>
        <div className="p-5 grid sm:grid-cols-2 gap-3">
          {lesson.funFacts.map((fact, i) => (
            <div key={i} className="flex items-start gap-2.5 bg-purple-50 rounded-xl p-3">
              <span className="text-purple-400 font-black text-sm mt-0.5 flex-shrink-0">0{i + 1}</span>
              <p className="text-sm text-stone-600 leading-relaxed">{fact}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Local Action CTA */}
      <section
        className="rounded-2xl overflow-hidden shadow-xl"
        style={{ background: 'linear-gradient(135deg, #f97316, #f43f5e)' }}
      >
        <div className="p-6 sm:p-8 text-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-yellow-300" />
                <span className="text-yellow-200 text-sm font-semibold">Your Local Action</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {lesson.localAction.icon} {lesson.localAction.title}
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                {lesson.localAction.description}
              </p>
              <div className="flex items-center gap-3 flex-wrap pt-2">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${difficultyColors[lesson.localAction.difficulty]} bg-white/20 border-white/30 text-white`}>
                  {lesson.localAction.difficulty}
                </span>
                <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1.5">
                  <Star size={12} className="text-yellow-300 fill-yellow-300" />
                  <span className="text-xs font-bold text-yellow-200">+{lesson.localAction.reward} XP on completion</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              id="btn-complete-action"
              className="flex-1 flex items-center justify-center gap-2 bg-white text-orange-600 font-bold py-3.5 rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
            >
              <CheckCircle2 size={18} />
              I'll Do This!
              <ChevronRight size={18} />
            </button>
            <Link
              href="/progress"
              className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur border border-white/30 text-white font-semibold py-3.5 px-5 rounded-xl hover:bg-white/30 transition-colors text-sm"
            >
              View Progress
            </Link>
          </div>
        </div>
      </section>

      {/* Nutrition Section */}
      <section className="bg-white rounded-2xl shadow-md border border-rose-50 overflow-hidden">
        <div className="flex items-center gap-3 p-5 border-b border-rose-50">
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
            <span className="text-lg">💪</span>
          </div>
          <h2 className="font-bold text-stone-800" style={{ fontFamily: 'Outfit, sans-serif' }}>Nutrition Highlights</h2>
        </div>
        <div className="p-5 space-y-2.5">
          {lesson.nutritionHighlights.map((item, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle2 size={16} className="text-rose-400 flex-shrink-0" />
              <span className="text-sm text-stone-600">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="text-center pt-2">
        <p className="text-stone-500 text-sm mb-3">Want to explore another food?</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          Scan Another Food
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}

function LessonPage() {
  const searchParams = useSearchParams();
  const foodId  = searchParams.get('food') || 'strawberry';
  const ageMode = searchParams.get('age')  || '';
  const lang    = searchParams.get('lang') || 'en';

  const ageBadge: Record<string, { emoji: string; label: string }> = {
    kid:     { emoji: '🧒', label: lang === 'es' ? 'Niño/a'      : 'Kid' },
    student: { emoji: '🎒', label: lang === 'es' ? 'Estudiante'  : 'Student' },
    adult:   { emoji: '🧑', label: lang === 'es' ? 'Adulto/a'   : 'Adult' },
  };

  const langBadge: Record<string, { flag: string; label: string }> = {
    en: { flag: '🇺🇸', label: 'English' },
    es: { flag: '🇲🇽', label: 'Español' },
  };

  const ab = ageBadge[ageMode];
  const lb = langBadge[lang] ?? langBadge.en;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fffbf5 0%, #fff7ed 60%, #fef3c7 100%)' }}>
      <NavBar />
      {/* Mode pills */}
      {(ab || lb) && (
        <div className="max-w-3xl mx-auto px-4 pt-4 flex gap-2 flex-wrap">
          {ab && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: '#fff0f5', color: '#be185d', border: '1px solid #fecdd3' }}>
              {ab.emoji} {ab.label}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
            {lb.flag} {lb.label}
          </span>
        </div>
      )}
      <LessonContent foodId={foodId} />
    </div>
  );
}

export default function LessonPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #fffbf5, #fef3c7)' }}>
        <div className="text-center space-y-3">
          <div className="text-5xl float-anim">🌱</div>
          <p className="text-stone-500 font-semibold">Loading your lesson...</p>
        </div>
      </div>
    }>
      <LessonPage />
    </Suspense>
  );
}
