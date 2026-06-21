import { saveProfile, type UserProfile } from '@/lib/redis';

export async function POST(request: Request): Promise<Response> {
  let body: Partial<UserProfile>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { learnerType, language, learningStyle } = body;
  if (!learnerType || !language || !learningStyle) {
    return Response.json(
      { error: 'Missing required fields: learnerType, language, learningStyle' },
      { status: 400 }
    );
  }

  try {
    await saveProfile({ learnerType, language, learningStyle });
    return Response.json({ saved: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[save-profile] Redis error:', msg);
    // Non-fatal — lesson generation continues even without Redis
    return Response.json({ saved: false, warning: msg });
  }
}
