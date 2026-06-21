import {
  getProfile,
  getFoodsLearned,
  getStreak,
  recommendNextFood,
  isRedisConnected,
  FALLBACK_PROFILE,
  FALLBACK_FOODS_LEARNED,
  FALLBACK_STREAK,
} from '@/lib/redis';

const foodMeta: Record<string, { emoji: string; label: string }> = {
  strawberry: { emoji: '🍓', label: 'Strawberry' },
  tomato:     { emoji: '🍅', label: 'Tomato'     },
  lettuce:    { emoji: '🥬', label: 'Lettuce'    },
  apple:      { emoji: '🍎', label: 'Apple'      },
};

function mapFoods(foods: string[]) {
  return foods.map((id) => ({
    id,
    emoji: foodMeta[id]?.emoji ?? '🌿',
    label: foodMeta[id]?.label ?? id,
  }));
}

function fallbackResponse() {
  const nextFood = recommendNextFood(FALLBACK_FOODS_LEARNED);
  return {
    redisConnected: false,
    error: 'Demo memory unavailable — using local session.',
    profile: FALLBACK_PROFILE,
    foodsLearned: mapFoods(FALLBACK_FOODS_LEARNED),
    lessonCount: FALLBACK_FOODS_LEARNED.length,
    streak: { days: FALLBACK_STREAK.days },
    nextRecommendation: {
      id:    nextFood,
      emoji: foodMeta[nextFood]?.emoji ?? '🌿',
      label: foodMeta[nextFood]?.label ?? nextFood,
    },
  };
}

export async function GET(): Promise<Response> {
  const connected = await isRedisConnected();
  if (!connected) {
    return Response.json(fallbackResponse());
  }

  try {
    const [profile, foodsLearned, streak] = await Promise.all([
      getProfile(),
      getFoodsLearned(),
      getStreak(),
    ]);

    const nextFood = recommendNextFood(foodsLearned);

    return Response.json({
      redisConnected: true,
      profile: profile ?? FALLBACK_PROFILE,
      foodsLearned: mapFoods(foodsLearned),
      lessonCount: foodsLearned.length,
      streak: { days: streak.days },
      nextRecommendation: {
        id:    nextFood,
        emoji: foodMeta[nextFood]?.emoji ?? '🌿',
        label: foodMeta[nextFood]?.label ?? nextFood,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[get-progress] Redis error:', msg);
    return Response.json(fallbackResponse());
  }
}
