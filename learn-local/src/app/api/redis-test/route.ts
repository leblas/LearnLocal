import { rawSet, rawGet, isRedisConnected } from '@/lib/redis';

export async function GET(): Promise<Response> {
  const connected = await isRedisConnected();
  if (!connected) {
    return Response.json({
      success: false,
      error: 'Redis is not connected. Check REDIS_HOST, REDIS_PORT, REDIS_USERNAME, and REDIS_PASSWORD in .env.local',
    });
  }

  try {
    await rawSet('foo', 'bar');
    const value = await rawGet('foo');

    return Response.json({
      success: true,
      value,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return Response.json({
      success: false,
      error: msg,
    });
  }
}
