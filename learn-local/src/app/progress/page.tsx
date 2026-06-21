'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import { userProgress, communityFeed, leaderboard } from '@/lib/data';
import { Star, Award, Flame, Users, ChevronRight, Trophy, Target, BookOpen, Zap, Sparkles } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface FoodEntry { id: string; emoji: string; label: string; }
interface ProgressData {
  profile:            { learnerType: string; language: string; learningStyle: string } | null;
  foodsLearned:       FoodEntry[];
  lessonCount:        number;
  streak:             { days: number };
  nextRecommendation: FoodEntry;
  redisConnected:     boolean;
  error?:             string;
}

const allBadges = [
  { id: 'local-hero',    name: 'Local Hero',    icon: '🏠', desc: 'Visited a local farm',         earned: true  },
  { id: 'eco-warrior',   name: 'Eco Warrior',   icon: '🌿', desc: 'Chose 5 eco-friendly foods',    earned: true  },
  { id: 'garden-guru',   name: 'Garden Guru',   icon: '🌱', desc: 'Grew your own food',            earned: true  },
  { id: 'seed-saver',    name: 'Seed Saver',    icon: '🌾', desc: 'Learned about 3 food origins',  earned: true  },
  { id: 'market-maven',  name: 'Market Maven',  icon: '🏪', desc: 'Attended a farmers market',     earned: false },
  { id: 'season-seeker', name: 'Season Seeker', icon: '📅', desc: 'Tracked seasonal foods',         earned: false },
  { id: 'pollinator-pal',name: 'Pollinator Pal',icon: '🐝', desc: 'Planted pollinator flowers',     earned: false },
  { id: 'compost-king',  name: 'Compost King',  icon: '♻️', desc: 'Started a compost bin',          earned: false },
];

type Tab = 'progress' | 'community' | 'leaderboard';

export default function ProgressPage() {
  const [activeTab, setActiveTab] = useState<Tab>('progress');
  const levelPct = ((userProgress.xp - 200) / (userProgress.nextLevelXp - 200)) * 100;

  // ── Redis memory state ────────────────────────────────────────────────────
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [redisLoading, setRedisLoading] = useState(true);

  useEffect(() => {
    fetch('/api/get-progress')
      .then((r) => r.json())
      .then((d) => setProgressData(d))
      .catch(() => setProgressData(null))
      .finally(() => setRedisLoading(false));
  }, []);

  const ageLabelMap: Record<string, string> = {
    kid: 'Kid 🧒', student: 'Student 🎒', adult: 'Adult 🧑',
  };
  const langLabelMap: Record<string, string> = {
    English: '🇺🇸 English', Spanish: '🇲🇽 Spanish',
  };
  const styleLabelMap: Record<string, string> = {
    story: '📖 Story', visual: '👁️ Visual', quick: '⚡ Quick Facts',
  };

  function journeyLessonUrl(foodId: string): string {
    const p = progressData?.profile;
    const age = p?.learnerType ?? 'student';
    const langParam = p?.language === 'Spanish' ? 'es' : 'en';
    const style = p?.learningStyle ?? 'story';
    return `/lesson?food=${foodId}&age=${age}&lang=${langParam}&style=${style}`;
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'progress', label: 'My Progress', icon: <Target size={15} /> },
    { id: 'community', label: 'Community', icon: <Users size={15} /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={15} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #fffbf5 0%, #fff7ed 60%, #fef3c7 100%)' }}>
      <NavBar />

      <div className="max-w-3xl mx-auto px-4 py-6 pb-16 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-bold text-stone-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Your <span className="gradient-text">Journey</span>
          </h1>
          <p className="text-stone-500 text-sm">Your personalized food learning journey</p>
        </div>

        {/* Profile / XP Card */}
        <div
          className="rounded-3xl overflow-hidden shadow-xl"
          style={{ background: 'linear-gradient(135deg, #f97316 0%, #f43f5e 60%, #ec4899 100%)' }}
        >
          {/* Community image strip */}
          <div className="relative h-28 overflow-hidden">
            <Image
              src="/community.png"
              alt="Local community farmers market"
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-500/60" />
          </div>

          <div className="p-5 text-white -mt-2">
            <div className="flex items-end justify-between flex-wrap gap-4">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/40 backdrop-blur flex items-center justify-center text-2xl shadow-lg -mt-8">
                  ⭐
                </div>
                <div>
                  <div className="text-xs font-semibold text-orange-200">Level {userProgress.level} Explorer</div>
                  <div className="text-xl font-bold">{userProgress.levelName}</div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex gap-4 flex-wrap">
                <div className="text-center">
                  <div className="text-2xl font-bold">{userProgress.xp}</div>
                  <div className="text-xs text-orange-200">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-1 text-2xl font-bold">
                    <Flame size={20} className="text-yellow-300" />
                    {userProgress.streak}
                  </div>
                  <div className="text-xs text-orange-200">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">#{userProgress.communityRank}</div>
                  <div className="text-xs text-orange-200">Ranking</div>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-orange-200">Progress to Level {userProgress.level + 1}</span>
                <span className="font-bold">{userProgress.xp} / {userProgress.nextLevelXp} XP</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white/80 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(levelPct, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: BookOpen, label: 'Lessons', value: progressData?.lessonCount ?? userProgress.lessonsCompleted, color: 'text-blue-500', bg: 'bg-blue-50' },
            { icon: Award, label: 'Badges', value: userProgress.badgesEarned.length, color: 'text-amber-500', bg: 'bg-amber-50' },
            { icon: Zap, label: 'Actions Done', value: 3, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          ].map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 text-center card-lift`}>
              <Icon size={20} className={`${color} mx-auto mb-1.5`} />
              <div className="text-2xl font-bold text-stone-800">{value}</div>
              <div className="text-xs text-stone-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Tab Selector */}
        <div className="bg-white rounded-2xl shadow-md border border-orange-50 overflow-hidden">
          {/* Tab Header */}
          <div className="flex border-b border-stone-100">
            {tabs.map(({ id, label, icon }) => (
              <button
                key={id}
                id={`tab-${id}`}
                onClick={() => setActiveTab(id)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-4 text-xs sm:text-sm font-bold transition-colors ${
                  activeTab === id
                    ? 'text-orange-600 bg-orange-50/50'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {icon}
                {label}
                {activeTab === id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-rose-500" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-5">
            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <div className="space-y-5">

                {/* ── Redis Memory Card ─────────────────────────────── */}
                <div
                  className="rounded-2xl p-4 space-y-3"
                  style={{ background: '#f5f3ff', border: '1.5px solid #ddd6fe' }}
                >
                  <h3 className="font-bold text-violet-800 flex items-center gap-2 text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <Sparkles size={15} className="text-violet-500" />
                    Your Learner Profile
                    {progressData?.redisConnected && (
                      <span className="ml-auto text-xs bg-violet-100 text-violet-600 font-semibold px-2 py-0.5 rounded-full">
                        ✓ Redis live
                      </span>
                    )}
                  </h3>

                  {redisLoading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 w-1/2 rounded bg-violet-100" />
                      <div className="h-3 w-2/3 rounded bg-violet-100" />
                    </div>
                  ) : progressData ? (
                    <div className="space-y-3">
                      {!progressData.redisConnected && progressData.error && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2">
                          {progressData.error}
                        </p>
                      )}

                      {progressData.profile && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#fff0f5', color: '#be185d', border: '1px solid #fecdd3' }}>
                            {ageLabelMap[progressData.profile.learnerType] ?? progressData.profile.learnerType}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#fff7ed', color: '#c2410c', border: '1px solid #fed7aa' }}>
                            {langLabelMap[progressData.profile.language] ?? progressData.profile.language}
                          </span>
                          {progressData.profile.learningStyle && (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' }}>
                              {styleLabelMap[progressData.profile.learningStyle] ?? progressData.profile.learningStyle}
                            </span>
                          )}
                        </div>
                      )}

                      {progressData.foodsLearned.length === 0 && (
                        <div className="text-center py-4 px-3 rounded-xl" style={{ background: '#fafaf9', border: '1px dashed #d6d3d1' }}>
                          <p className="text-sm text-stone-500">No foods explored yet.</p>
                          <Link href="/" className="text-xs font-bold text-orange-600 hover:text-orange-700 mt-2 inline-block">
                            Start your first lesson →
                          </Link>
                        </div>
                      )}

                      {progressData.foodsLearned.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-violet-600 mb-1.5">Foods Explored</p>
                          <div className="flex flex-wrap gap-2">
                            {progressData.foodsLearned.map((f) => (
                              <span key={f.id} className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #a7f3d0' }}>
                                {f.emoji} {f.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Flame size={14} className="text-orange-500" />
                          <span className="text-xs font-bold text-stone-700">{progressData.streak.days}-day streak</span>
                          {progressData.lessonCount > 0 && (
                            <span className="text-xs text-stone-500">· {progressData.lessonCount} lesson{progressData.lessonCount !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        <Link
                          href={journeyLessonUrl(progressData.nextRecommendation.id)}
                          className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1"
                        >
                          Try {progressData.nextRecommendation.emoji} {progressData.nextRecommendation.label} next
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-violet-500">
                      Demo memory unavailable — using local session.
                    </p>
                  )}
                </div>

                {/* Badges Section */}
                <div>
                  <h3 className="font-bold text-stone-700 mb-3 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <Award size={16} className="text-amber-500" />
                    Badges ({userProgress.badgesEarned.length}/{allBadges.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {allBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-center transition-all ${
                          badge.earned
                            ? 'bg-amber-50 border border-amber-200'
                            : 'bg-stone-50 border border-stone-200 opacity-50 grayscale'
                        }`}
                        title={badge.desc}
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="text-xs font-semibold text-stone-700 leading-tight">{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Journey from Redis */}
                <div>
                  <h3 className="font-bold text-stone-700 mb-3 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <BookOpen size={16} className="text-blue-500" />
                    Recent Journey
                  </h3>
                  {progressData && progressData.foodsLearned.length > 0 ? (
                    <div className="space-y-2">
                      {progressData.foodsLearned.map((f) => (
                        <Link
                          key={f.id}
                          href={journeyLessonUrl(f.id)}
                          className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl hover:bg-orange-50 transition-colors"
                        >
                          <span className="text-2xl">{f.emoji}</span>
                          <div className="flex-1">
                            <div className="font-semibold text-stone-800 text-sm">{f.label}</div>
                            <div className="text-xs text-stone-400">Explored · tap to revisit</div>
                          </div>
                          <ChevronRight size={14} className="text-stone-400" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 px-4 rounded-xl bg-stone-50 border border-dashed border-stone-200">
                      <p className="text-sm text-stone-500">Your food journey starts here.</p>
                      <Link href="/" className="text-xs font-bold text-orange-600 mt-2 inline-block">Explore your first food →</Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Community Tab */}
            {activeTab === 'community' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-700" style={{ fontFamily: 'Outfit, sans-serif' }}>Community Activity</h3>
                  <span className="text-xs text-stone-400">Live feed</span>
                </div>
                <div className="space-y-3">
                  {communityFeed.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-stone-50 rounded-xl hover:bg-orange-50/50 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-lg flex-shrink-0">
                        {item.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm">
                          <span className="font-bold text-stone-800">{item.user}</span>
                          <span className="text-stone-500"> {item.action} </span>
                          <span className="text-xl">{item.food}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-stone-400">{item.time}</span>
                          <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
                            <Star size={9} className="fill-amber-400 text-amber-400" />
                            +{item.xp} XP
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Join CTA */}
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 text-center">
                  <p className="text-sm font-semibold text-stone-700 mb-2">🌟 Complete your local action to appear here!</p>
                  <Link
                    href="/lesson?food=strawberry"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700"
                  >
                    View Current Lesson <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-700" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    Top Explorers This Month
                  </h3>
                  <span className="text-xs bg-orange-100 text-orange-600 font-semibold px-2.5 py-1 rounded-full">June 2026</span>
                </div>

                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        (entry as typeof entry & { isYou?: boolean }).isYou
                          ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-300 shadow-sm'
                          : 'bg-stone-50'
                      }`}
                    >
                      <div className="w-7 text-center font-black text-lg">{entry.badge}</div>
                      <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center text-lg">
                        {entry.avatar}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-sm ${(entry as typeof entry & { isYou?: boolean }).isYou ? 'text-orange-700' : 'text-stone-800'}`}>
                            {entry.user}
                          </span>
                          {(entry as typeof entry & { isYou?: boolean }).isYou && (
                            <span className="text-xs bg-orange-200 text-orange-700 font-bold px-1.5 py-0.5 rounded-full">You</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 font-bold text-sm">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        {entry.xp.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 rounded-xl p-4 text-center space-y-2">
                  <p className="text-sm font-bold text-stone-700">You're #{userProgress.communityRank} out of 1,247 explorers! 🎉</p>
                  <p className="text-xs text-stone-500">Complete more lessons and local actions to climb the ranks.</p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-rose-600 hover:text-rose-700"
                  >
                    Scan a New Food <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Goals */}
        <div className="bg-white rounded-2xl shadow-md border border-orange-50 p-5">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Target size={16} className="text-orange-500" />
            Next Goals
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Reach Level 4', current: 340, target: 500, icon: '🏆', color: '#f97316' },
              { label: 'Earn Market Maven badge', current: 2, target: 3, icon: '🏪', color: '#3b82f6' },
              { label: 'Complete 10 lessons', current: 7, target: 10, icon: '📖', color: '#10b981' },
            ].map(({ label, current, target, icon, color }) => {
              const pct = Math.min((current / target) * 100, 100);
              return (
                <div key={label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{icon}</span>
                      <span className="font-medium text-stone-700">{label}</span>
                    </div>
                    <span className="text-xs text-stone-400 font-semibold">{current}/{target}</span>
                  </div>
                  <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-sm text-stone-500 font-medium italic mt-6">
          Learning one food at a time.
        </p>
      </div>
    </div>
  );
}
