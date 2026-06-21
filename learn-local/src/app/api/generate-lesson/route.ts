import Anthropic from '@anthropic-ai/sdk';

// ── Types ────────────────────────────────────────────────────────────────────
type LearnerType = 'kid' | 'student' | 'adult';

interface RequestBody {
  food: string;
  learnerType: LearnerType;
  language: string;
  learningStyle: string;
}

export interface LessonResult {
  foodStory: string;
  learn: string;
  impact: string;
  takeAction: string;
  funFact: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const VALID_FOODS = ['strawberry', 'tomato', 'lettuce', 'apple'];
const VALID_LEARNER_TYPES: LearnerType[] = ['kid', 'student', 'adult'];

function buildUserPrompt(body: RequestBody): string {
  const toneMap: Record<LearnerType, string> = {
    kid: 'Use very simple words, short playful sentences, and a warm encouraging tone. Think picture-book style. Avoid jargon entirely.',
    student:
      'Use clear educational language with moderate detail. Frame facts within a learning context. Include cause-and-effect where relevant.',
    adult:
      'Be practical, concise, and sustainability-focused. Include actionable insights and real-world relevance. Assume adult literacy.',
  };

  return `Generate a personalized food education lesson with these parameters:

- Food item: ${body.food}
- Learner type: ${body.learnerType}
- Language: ${body.language}
- Learning style: ${body.learningStyle}
- Tone guidance: ${toneMap[body.learnerType]}

Write ENTIRELY in ${body.language}.

Return ONLY a valid JSON object with exactly these five keys. No markdown, no code fences, no extra text:

{
  "foodStory": "2-3 sentences: where this food comes from and its journey to the learner.",
  "learn": "1-2 sentences: one key educational concept about this food.",
  "impact": "2-3 sentences: the environmental or community impact of choosing this food locally.",
  "takeAction": "1-2 sentences: one specific, realistic local action the learner can take today.",
  "funFact": "1 sentence: a memorable, surprising fact about this food."
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
  const { food, learnerType, language, learningStyle } = body;

  if (!food || !learnerType || !language || !learningStyle) {
    return Response.json(
      {
        error: 'Missing required fields',
        required: ['food', 'learnerType', 'language', 'learningStyle'],
        received: body,
      },
      { status: 400 }
    );
  }

  if (!VALID_FOODS.includes(food)) {
    return Response.json(
      { error: `Invalid food. Must be one of: ${VALID_FOODS.join(', ')}` },
      { status: 400 }
    );
  }

  if (!VALID_LEARNER_TYPES.includes(learnerType as LearnerType)) {
    return Response.json(
      { error: `Invalid learnerType. Must be one of: ${VALID_LEARNER_TYPES.join(', ')}` },
      { status: 400 }
    );
  }

  // 4. Call Claude
  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 600,
      system: `You are LearnLocal, an AI educator that teaches users about food systems in a personalized, engaging, and age-appropriate way.

Generate educational content based on:
- learner type (kid / student / adult)
- language (write the full lesson in that language)
- learning style

Keep responses:
- factual and accurate
- concise (stay within the requested length)
- encouraging and positive
- action-oriented

Always return ONLY valid JSON — no markdown fences, no commentary.`,
      messages: [
        {
          role: 'user',
          content: buildUserPrompt({ food, learnerType, language, learningStyle } as RequestBody),
        },
      ],
    });

    // 5. Extract and parse the JSON from Claude's response
    const rawText =
      message.content[0].type === 'text' ? message.content[0].text.trim() : '';

    // Strip any accidental markdown fences Claude might emit
    const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    let lesson: LessonResult;
    try {
      lesson = JSON.parse(cleaned);
    } catch {
      console.error('Claude returned non-JSON:', rawText);
      return Response.json(
        { error: 'Claude returned an unexpected format. Please try again.' },
        { status: 502 }
      );
    }

    // 6. Validate the shape of the response
    const requiredKeys: (keyof LessonResult)[] = [
      'foodStory',
      'learn',
      'impact',
      'takeAction',
      'funFact',
    ];
    for (const key of requiredKeys) {
      if (typeof lesson[key] !== 'string' || !lesson[key]) {
        return Response.json(
          { error: `Claude response missing required field: ${key}` },
          { status: 502 }
        );
      }
    }

    return Response.json(lesson, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('Claude API error:', msg);
    return Response.json({ error: `Claude API error: ${msg}` }, { status: 502 });
  }
}
