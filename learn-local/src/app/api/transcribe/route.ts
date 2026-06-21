import { transcribeAudio, type LearnerLanguage } from '@/lib/deepgram';

export async function POST(request: Request): Promise<Response> {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey || apiKey === 'your-deepgram-api-key-here') {
    return Response.json(
      { error: 'DEEPGRAM_API_KEY is not configured in .env.local' },
      { status: 500 },
    );
  }

  try {
    const formData = await request.formData();
    const audio = formData.get('audio');
    const language = (formData.get('language') as LearnerLanguage) || 'English';

    if (!(audio instanceof Blob) || audio.size === 0) {
      return Response.json({ error: 'No audio provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await audio.arrayBuffer());
    const mimeType = audio.type || 'audio/webm';

    const { text } = await transcribeAudio(buffer, language, mimeType);

    return Response.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Transcription failed';
    console.error('[transcribe]', msg);
    return Response.json({ error: msg }, { status: 502 });
  }
}
