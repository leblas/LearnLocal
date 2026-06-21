import path from 'path';
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import {
  saveProfile,
  addFoodLearned,
  updateStreak,
  getProfile,
  getFoodsLearned,
  getStreak,
  recommendNextFood,
  isRedisConnected,
  getFallbackMemory,
  type UserProfile,
} from '@/lib/redis';
import { resolveFoodFromTranscript } from '@/lib/foodFromTranscript';

// ── Types ────────────────────────────────────────────────────────────────────
type LearnerType = 'kid' | 'student' | 'adult';

interface RequestBody {
  food:             string;
  learnerType:      LearnerType;
  language:         string;
  learningStyle:    string;
  voiceTranscript?: string;
}

interface LessonResult {
  foodStory:  string;
  learn:      string;
  impact:     string;
  takeAction: string;
  funFact:    string;
}

interface FoodEntry {
  id:               string;
  name:             string;
  emoji:            string;
  foodStory:        string;
  sustainability:   string;
  seasonality:      string;
  funFacts:         string[];
  communityActions: string[];
}

interface CommunityEntry {
  id:              string;
  name:            string;
  type:            string;
  description:     string;
  communityAction: string;
}

// ── Validation ───────────────────────────────────────────────────────────────
const VALID_FOODS:         string[]      = ['strawberry', 'tomato', 'lettuce', 'apple'];
const VALID_LEARNER_TYPES: LearnerType[] = ['kid', 'student', 'adult'];

// ── Load static context ──────────────────────────────────────────────────────
function loadFoodContext(foodId: string): FoodEntry | null {
  try {
    const filePath = path.join(process.cwd(), 'data', 'foods.json');
    const foods: FoodEntry[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return foods.find((f) => f.id === foodId) ?? null;
  } catch (err) {
    console.error('[generate-lesson] Failed to load foods.json:', err);
    return null;
  }
}

function loadCommunityContext(): CommunityEntry[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'community.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    console.error('[generate-lesson] Failed to load community.json:', err);
    return [];
  }
}

// ── Prompt builder ───────────────────────────────────────────────────────────
function buildGroundedPrompt(
  body: RequestBody,
  foodCtx: FoodEntry | null,
  communityCtx: CommunityEntry[],
  memory: {
    profile: UserProfile;
    foodsLearned: string[];
    streak: { days: number };
  },
): string {
  const toneMap: Record<LearnerType, string> = {
    kid:     'Use very simple words (3rd-grade reading level), short playful sentences, and a warm encouraging tone. Avoid jargon entirely.',
    student: 'Use clear educational language with moderate detail. Frame facts within a learning context. Include cause-and-effect.',
    adult:   'Be practical, concise, and sustainability-focused. Include actionable insights and real-world relevance.',
  };

  const styleMap: Record<string, string> = {
    story:  'Present the lesson as a warm narrative journey. Connect ideas with story-like flow.',
    visual: 'Use vivid, sensory descriptions so the learner can picture farms, colors, and places. Paint scenes with words.',
    quick:  'Keep every section compact and focused. Short sentences. One clear idea per section. Fact-forward.',
    'quick facts': 'Keep every section compact and focused. Short sentences. One clear idea per section. Fact-forward.',
  };

  const styleGuide = styleMap[body.learningStyle.toLowerCase()] ?? styleMap.story;

  const previousFoods = memory.foodsLearned.filter((f) => f !== body.food);
  const priorContext = previousFoods.length > 0
    ? `The learner has already explored: ${previousFoods.join(', ')}. Reference this to make connections where natural (e.g., compare nutrients, growing conditions, or local actions). Example: "Since you already explored strawberries, today we will compare tomatoes and strawberries."`
    : 'This is the learner\'s first lesson.';

  const voiceBlock = body.voiceTranscript
    ? `\nVOICE TRANSCRIPT (what the learner asked):\n"${body.voiceTranscript}"\nAddress their spoken question directly in the opening of the lesson.\n`
    : '';

  const claudeInput = {
    profile:          memory.profile,
    foodsLearned:     memory.foodsLearned,
    streak:           memory.streak,
    foodContext:      foodCtx ? {
      name:             foodCtx.name,
      foodStory:        foodCtx.foodStory,
      sustainability:   foodCtx.sustainability,
      seasonality:      foodCtx.seasonality,
      funFacts:         foodCtx.funFacts,
      communityActions: foodCtx.communityActions,
    } : null,
    communityContext: communityCtx.slice(0, 2).map((c) => ({
      name:            c.name,
      type:            c.type,
      communityAction: c.communityAction,
    })),
    voiceTranscript: body.voiceTranscript ?? '',
  };

  return `You are grounding your lesson on the following verified local food data. Do NOT invent facts not present in this context. If a detail is unknown, acknowledge uncertainty rather than speculating.

---
CLAUDE INPUT (use all of this):
${JSON.stringify(claudeInput, null, 2)}

---
USER PROFILE:
- Learner type: ${body.learnerType}
- Language: ${body.language} (write the ENTIRE lesson in this language)
- Learning style: ${body.learningStyle}
- Style guidance: ${styleGuide}
- Tone guidance: ${toneMap[body.learnerType]}
- Prior learning: ${priorContext}
- Current streak: ${memory.streak.days} day(s)
${voiceBlock}
---
TASK:
Generate a personalized food lesson about "${body.food}". Write ENTIRELY in ${body.language}.
Personalize using profile, prior foods learned, streak, and voice transcript when present.
Stay grounded in foodContext and communityContext — never hallucinate facts.

Return ONLY a valid JSON object with exactly these five keys. No markdown, no code fences, no extra text:

{
  "foodStory":  "2-3 sentences describing where this food comes from, grounded in the context above.",
  "learn":      "1-2 sentences teaching one key educational concept about this food.",
  "impact":     "2-3 sentences on environmental or community impact, referencing the sustainability data above.",
  "takeAction": "1-2 sentences suggesting one concrete local action, drawing from communityActions or community context above.",
  "funFact":    "1 sentence — a memorable, specific fact from the funFacts list above."
}`;
}

// ── Route Handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request): Promise<Response> {
  // 1. Check API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your-anthropic-api-key-here') {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not configured in .env.local' },
      { status: 500 }
    );
  }

  // 2. Parse body
  let body: Partial<RequestBody>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  // 3. Validate required fields
  let { food, learnerType, language, learningStyle, voiceTranscript } = body;
  if (!food || !learnerType || !language || !learningStyle) {
    return Response.json(
      { error: 'Missing required fields', required: ['food', 'learnerType', 'language', 'learningStyle'] },
      { status: 400 }
    );
  }

  if (voiceTranscript) {
    food = resolveFoodFromTranscript(voiceTranscript, food);
  }
  if (!VALID_FOODS.includes(food)) {
    return Response.json({ error: `Invalid food. Must be one of: ${VALID_FOODS.join(', ')}` }, { status: 400 });
  }
  if (!VALID_LEARNER_TYPES.includes(learnerType as LearnerType)) {
    return Response.json({ error: `Invalid learnerType. Must be one of: ${VALID_LEARNER_TYPES.join(', ')}` }, { status: 400 });
  }

  // 4. Load static grounding context
  const foodCtx      = loadFoodContext(food);
  const communityCtx = loadCommunityContext();

  // 5. Read Redis memory
  const selectedProfile: UserProfile = { learnerType, language, learningStyle };
  let memoryContext = getFallbackMemory(selectedProfile);

  try {
    const [profile, foodsLearned, streak] = await Promise.all([
      getProfile(),
      getFoodsLearned(),
      getStreak(),
    ]);
    memoryContext = {
      profile: profile ?? selectedProfile,
      foodsLearned,
      streak: { days: streak.days },
      recommendedNextFood: recommendNextFood(foodsLearned),
    };
  } catch { /* use fallback */ }

  // 6. Save/update profile in Redis (non-blocking)
  try {
    await saveProfile({
      learnerType,
      language,
      learningStyle,
    } as UserProfile);
  } catch { /* non-fatal */ }

  // 7. Build prompt and call Claude
  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model:      'claude-sonnet-4-6',
      max_tokens: 700,
      system: `You are LearnLocal, an AI educator that teaches users about local food systems.
Generate lessons ONLY using the food and community context supplied in the user message.
If information is missing from the context, acknowledge uncertainty — never invent facts.
Keep responses: factual, concise, encouraging, and action-oriented.
Always return ONLY valid JSON — no markdown fences, no commentary.`,
      messages: [
        {
          role:    'user',
          content: buildGroundedPrompt(
            { food, learnerType, language, learningStyle, voiceTranscript } as RequestBody,
            foodCtx,
            communityCtx,
            {
              profile: memoryContext.profile,
              foodsLearned: memoryContext.foodsLearned,
              streak: memoryContext.streak,
            },
          ),
        },
      ],
    });

    // 8. Extract and clean the JSON
    const rawText = message.content[0].type === 'text' ? message.content[0].text.trim() : '';
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let lesson: LessonResult;
    try {
      lesson = JSON.parse(cleaned);
    } catch {
      console.error('[generate-lesson] Claude returned non-JSON:', rawText);
      return Response.json({ error: 'Claude returned an unexpected format. Please try again.' }, { status: 502 });
    }

    // 9. Validate required keys
    const requiredKeys: (keyof LessonResult)[] = ['foodStory', 'learn', 'impact', 'takeAction', 'funFact'];
    for (const key of requiredKeys) {
      if (typeof lesson[key] !== 'string' || !lesson[key]) {
        return Response.json({ error: `Claude response missing required field: ${key}` }, { status: 502 });
      }
    }

    // 10. Persist to Redis — add food learned + update streak (non-blocking)
    let memory = memoryContext;
    let redisConnected = false;

    try {
      redisConnected = await isRedisConnected();
      if (redisConnected) {
        await addFoodLearned(food);
        const streakData = await updateStreak();

        const [profile, foodsLearned] = await Promise.all([
          getProfile(),
          getFoodsLearned(),
        ]);

        memory = {
          profile: profile ?? selectedProfile,
          foodsLearned,
          streak: { days: streakData.days },
          recommendedNextFood: recommendNextFood(foodsLearned),
        };
      }
    } catch (err) {
      console.warn('[generate-lesson] Redis write failed (non-fatal):', err);
      memory = getFallbackMemory(selectedProfile);
      redisConnected = false;
    }

    // 11. Return lesson + memory
    return Response.json({
      lesson,
      memory: {
        ...memory,
        redisConnected,
      },
      resolvedFood: food,
      voiceTranscript: voiceTranscript ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[generate-lesson] Claude API error:', msg);
    return Response.json({ error: `Claude API error: ${msg}` }, { status: 502 });
  }
}
