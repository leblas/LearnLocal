/**
 * Server-side Deepgram utilities for LearnLocal voice.
 * STT: transcribeAudio()  ·  TTS: speakLesson()
 */

import { DeepgramClient } from '@deepgram/sdk';

export type LearnerLanguage = 'English' | 'Spanish';
export type LearnerType = 'kid' | 'student' | 'adult';

export interface TranscriptionResult {
  text: string;
}

export interface SpeakOptions {
  text:        string;
  language:    LearnerLanguage;
  learnerType: LearnerType;
}

// ── Voice models by profile ───────────────────────────────────────────────────
const VOICE_MODELS: Record<LearnerLanguage, Record<LearnerType, string>> = {
  English: {
    kid:     'aura-2-asteria-en',
    student: 'aura-2-thalia-en',
    adult:   'aura-2-orion-en',
  },
  Spanish: {
    kid:     'aura-2-estrella-es',
    student: 'aura-2-diana-es',
    adult:   'aura-2-selena-es',
  },
};

function getClient(): DeepgramClient {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey || apiKey === 'your-deepgram-api-key-here') {
    throw new Error('DEEPGRAM_API_KEY is not configured in .env.local');
  }
  return new DeepgramClient({ apiKey });
}

function sttLanguage(language: LearnerLanguage): string {
  return language === 'Spanish' ? 'es' : 'en';
}

// ── Speech-to-Text ────────────────────────────────────────────────────────────
export async function transcribeAudio(
  audioBuffer: Buffer,
  language: LearnerLanguage,
  mimeType = 'audio/webm',
): Promise<TranscriptionResult> {
  const client = getClient();

  const response = await client.listen.v1.media.transcribeFile(
    { data: audioBuffer, contentType: mimeType, filename: 'recording.webm' },
    {
      model:        'nova-2',
      language:     sttLanguage(language),
      smart_format: true,
      punctuate:    true,
    },
  );

  const text =
    'results' in response
      ? response.results?.channels?.[0]?.alternatives?.[0]?.transcript?.trim() ?? ''
      : '';

  if (!text) {
    throw new Error('No speech detected');
  }

  return { text };
}

// ── Text-to-Speech ────────────────────────────────────────────────────────────
export async function speakLesson(options: SpeakOptions): Promise<ArrayBuffer> {
  const { text, language, learnerType } = options;
  const client = getClient();
  const model = VOICE_MODELS[language][learnerType];

  const response = await client.speak.v1.audio.generate({
    text,
    model,
    encoding:  'linear16',
    container: 'wav',
  });

  return response.arrayBuffer();
}

/** Build narratable script from lesson sections (Food Story, Learn, Fun Fact only). */
export function buildNarrationScript(
  lesson: { foodStory: string; learn: string; funFact: string },
): string {
  return [lesson.foodStory, lesson.learn, lesson.funFact]
    .filter(Boolean)
    .join('\n\n');
}
