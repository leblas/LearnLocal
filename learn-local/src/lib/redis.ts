/**
 * Singleton node-redis client for LearnLocal demo memory.
 *
 * Keys (JSON strings):
 *   user:demo:profile       – { learnerType, language, learningStyle }
 *   user:demo:foodsLearned  – ["strawberry", "tomato", ...]
 *   user:demo:streak        – { days }
 */

import { createClient, type RedisClientType } from 'redis';

// ── Demo fallbacks when Redis is unavailable ─────────────────────────────────
export const FALLBACK_PROFILE: UserProfile = {
  learnerType: 'kid',
  language: 'English',
  learningStyle: 'story',
};

export const FALLBACK_FOODS_LEARNED = ['strawberry', 'tomato'];
export const FALLBACK_STREAK: StreakData = { days: 3 };

// ── Types ─────────────────────────────────────────────────────────────────────
export interface UserProfile {
  learnerType: string;
  language: string;
  learningStyle: string;
}

export interface StreakData {
  days: number;
  lastDate?: string;
}

// ── Key constants ─────────────────────────────────────────────────────────────
const KEYS = {
  profile: 'user:demo:profile',
  foodsLearned: 'user:demo:foodsLearned',
  streak: 'user:demo:streak',
} as const;

const FOOD_SEQUENCE = ['strawberry', 'tomato', 'lettuce', 'apple'];

// ── Connection URL ────────────────────────────────────────────────────────────
function buildRedisUrl(): string | null {
  const host = process.env.REDIS_HOST;
  const port = process.env.REDIS_PORT;
  const user = process.env.REDIS_USERNAME || 'default';
  const pass = process.env.REDIS_PASSWORD;

  if (!host || !port || !pass || pass === 'PASTE_PASSWORD_HERE') return null;

  return `redis://${user}:${encodeURIComponent(pass)}@${host}:${port}`;
}

// ── Singleton client ──────────────────────────────────────────────────────────
let _client: RedisClientType | null = null;
let _connectPromise: Promise<RedisClientType | null> | null = null;

async function getClient(): Promise<RedisClientType | null> {
  const url = buildRedisUrl();
  if (!url) return null;

  if (!_client) {
    _client = createClient({
      url,
      socket: {
        connectTimeout: 5_000,
        reconnectStrategy: (retries) => (retries > 2 ? false : Math.min(retries * 200, 1_000)),
      },
    });

    _client.on('error', (err) => {
      console.error('[Redis] connection error:', err.message);
    });
  }

  if (!_connectPromise) {
    _connectPromise = (async () => {
      try {
        if (!_client!.isOpen) {
          await _client!.connect();
        }
        return _client;
      } catch (err) {
        console.error('[Redis] failed to connect:', err);
        _connectPromise = null;
        try {
          if (_client?.isOpen) await _client.quit();
        } catch {
          /* ignore */
        }
        _client = null;
        return null;
      }
    })();
  }

  return _connectPromise;
}

/** Check whether Redis is reachable */
export async function isRedisConnected(): Promise<boolean> {
  const client = await getClient();
  if (!client) return false;
  try {
    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

// ── Profile ───────────────────────────────────────────────────────────────────
export async function saveProfile(profile: UserProfile): Promise<void> {
  const client = await getClient();
  if (!client) return;
  await client.set(KEYS.profile, JSON.stringify(profile));
}

export async function getProfile(): Promise<UserProfile | null> {
  const client = await getClient();
  if (!client) return null;
  const raw = await client.get(KEYS.profile);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as UserProfile;
    return parsed.learnerType ? parsed : null;
  } catch {
    return null;
  }
}

// ── Foods learned ─────────────────────────────────────────────────────────────
export async function addFoodLearned(foodId: string): Promise<void> {
  const client = await getClient();
  if (!client) return;

  const current = await getFoodsLearned();
  if (current.includes(foodId)) return;

  const updated = [foodId, ...current.filter((id) => id !== foodId)].slice(0, 50);
  await client.set(KEYS.foodsLearned, JSON.stringify(updated));
}

export async function getFoodsLearned(): Promise<string[]> {
  const client = await getClient();
  if (!client) return [];

  const raw = await client.get(KEYS.foodsLearned);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

// ── Streak ────────────────────────────────────────────────────────────────────
function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function updateStreak(): Promise<StreakData> {
  const today = todayISO();
  const client = await getClient();
  if (!client) return { days: 1, lastDate: today };

  const raw = await client.get(KEYS.streak);
  let streak: StreakData = { days: 0, lastDate: '' };

  if (raw) {
    try {
      streak = JSON.parse(raw) as StreakData;
    } catch {
      streak = { days: 0, lastDate: '' };
    }
  }

  if (streak.lastDate === today) {
    return { days: streak.days };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const newDays = streak.lastDate === yesterdayStr ? streak.days + 1 : 1;
  const updated: StreakData = { days: newDays, lastDate: today };
  await client.set(KEYS.streak, JSON.stringify({ days: updated.days, lastDate: updated.lastDate }));
  return { days: updated.days };
}

export async function getStreak(): Promise<StreakData> {
  const client = await getClient();
  if (!client) return { days: 0 };

  const raw = await client.get(KEYS.streak);
  if (!raw) return { days: 0 };

  try {
    const parsed = JSON.parse(raw) as StreakData;
    return { days: parsed.days ?? 0 };
  } catch {
    return { days: 0 };
  }
}

// ── Raw get/set for the test route ────────────────────────────────────────────
export async function rawSet(key: string, value: string): Promise<void> {
  const client = await getClient();
  if (!client) throw new Error('Redis not connected');
  await client.set(key, value);
}

export async function rawGet(key: string): Promise<string | null> {
  const client = await getClient();
  if (!client) throw new Error('Redis not connected');
  return client.get(key);
}

// ── Recommendation ────────────────────────────────────────────────────────────
export function recommendNextFood(learned: string[]): string {
  const learnedSet = new Set(learned);
  for (const food of FOOD_SEQUENCE) {
    if (!learnedSet.has(food)) return food;
  }
  return learned[learned.length - 1] ?? 'strawberry';
}

// ── Fallback helpers ──────────────────────────────────────────────────────────
export function getFallbackMemory(profile?: UserProfile | null) {
  return {
    profile: profile ?? FALLBACK_PROFILE,
    foodsLearned: [...FALLBACK_FOODS_LEARNED],
    streak: { ...FALLBACK_STREAK },
    recommendedNextFood: recommendNextFood(FALLBACK_FOODS_LEARNED),
  };
}
