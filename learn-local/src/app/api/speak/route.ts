import { speakLesson, type LearnerLanguage, type LearnerType } from '@/lib/deepgram';

interface SpeakBody {
  text:         string;
  language:     LearnerLanguage;
  learnerType:  LearnerType;
}

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey || apiKey === 'your-deepgram-api-key-here') {
    return Response.json(
      { error: 'DEEPGRAM_API_KEY is not configured in .env.local' },
      { status: 500 },
    );
  }

  let body: Partial<SpeakBody>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { text, language, learnerType } = body;
  if (!text || !language || !learnerType) {
    return Response.json(
      { error: 'Missing required fields: text, language, learnerType' },
      { status: 400 },
    );
  }

  try {
    const audioBuffer = await speakLesson({ text, language, learnerType });

    return new Response(audioBuffer, {
      headers: {
        'Content-Type':  'audio/wav',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Speech synthesis failed';
    console.error('[speak]', msg);
    return Response.json({ error: msg }, { status: 502 });
  }
}
