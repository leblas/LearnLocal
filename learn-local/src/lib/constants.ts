export type AgeMode = 'kid' | 'student' | 'adult';
export type LangMode = 'en' | 'es';
export type LearningStyle = 'story' | 'visual' | 'quick';

export const FOOD_ITEMS = [
  { id: 'strawberry', emoji: '🍓', en: 'Strawberry', es: 'Fresa',    accent: '#e11d48', lightBg: '#fff1f2', border: '#fecdd3' },
  { id: 'tomato',     emoji: '🍅', en: 'Tomato',     es: 'Jitomate', accent: '#ea580c', lightBg: '#fff7ed', border: '#fed7aa' },
  { id: 'lettuce',    emoji: '🥬', en: 'Lettuce',    es: 'Lechuga',  accent: '#16a34a', lightBg: '#f0fdf4', border: '#a7f3d0' },
  { id: 'apple',      emoji: '🍎', en: 'Apple',      es: 'Manzana',  accent: '#dc2626', lightBg: '#fef2f2', border: '#fecaca' },
] as const;

export const LEARNING_STYLES: {
  id: LearningStyle;
  emoji: string;
  en: string;
  es: string;
  enDesc: string;
  esDesc: string;
}[] = [
  { id: 'story',  emoji: '📖', en: 'Story',       es: 'Historia',      enDesc: 'Narrative & discovery',  esDesc: 'Narrativa y descubrimiento' },
  { id: 'visual', emoji: '👁️', en: 'Visual',      es: 'Visual',        enDesc: 'Vivid descriptions',     esDesc: 'Descripciones vívidas' },
  { id: 'quick',  emoji: '⚡', en: 'Quick Facts', es: 'Datos rápidos', enDesc: 'Compact & focused',      esDesc: 'Compacto y directo' },
];

export const STYLE_LABEL: Record<LearningStyle, { en: string; es: string }> = {
  story:  { en: 'Story',       es: 'Historia' },
  visual: { en: 'Visual',      es: 'Visual' },
  quick:  { en: 'Quick Facts', es: 'Datos rápidos' },
};

export function toApiLanguage(lang: LangMode): 'English' | 'Spanish' {
  return lang === 'es' ? 'Spanish' : 'English';
}

export function foodLabel(id: string, lang: LangMode): string {
  const item = FOOD_ITEMS.find((f) => f.id === id);
  if (!item) return id;
  return lang === 'es' ? item.es : item.en;
}

export async function saveProfileToRedis(profile: {
  learnerType: string;
  language: string;
  learningStyle: string;
}): Promise<void> {
  try {
    await fetch('/api/save-profile', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
  } catch { /* non-fatal */ }
}

export const VOICE_TRANSCRIPT_KEY = 'learnlocal_voice_transcript';
