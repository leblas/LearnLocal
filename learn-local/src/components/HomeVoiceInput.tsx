'use client';

import { useState } from 'react';
import PushToTalk, { type PushToTalkState } from '@/components/PushToTalk';
import { resolveFoodFromTranscript } from '@/lib/foodFromTranscript';

interface HomeVoiceInputProps {
  language: 'English' | 'Spanish';
  lang: 'en' | 'es';
  fallbackFood: string;
  disabled?: boolean;
  onFoodDetected: (foodId: string, transcript: string) => void;
  onError: (msg: string) => void;
}

export default function HomeVoiceInput({
  language,
  lang,
  fallbackFood,
  disabled,
  onFoodDetected,
  onError,
}: HomeVoiceInputProps) {
  const [state, setState] = useState<PushToTalkState>('idle');
  const [transcript, setTranscript] = useState<string | null>(null);

  async function handleTranscript(text: string) {
    setTranscript(text);
    const foodId = resolveFoodFromTranscript(text, fallbackFood);
    onFoodDetected(foodId, text);
    setState('finished');
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-center text-stone-400 font-medium">
        {lang === 'es' ? '— o habla tu alimento —' : '— or speak your food —'}
      </p>
      <PushToTalk
        language={language}
        state={state}
        disabled={disabled || state === 'processing'}
        onStateChange={setState}
        onTranscript={handleTranscript}
        onError={(msg) => { onError(msg); setState('error'); }}
      />
      {transcript && state === 'finished' && (
        <p className="text-xs text-violet-600 italic text-center">
          &ldquo;{transcript}&rdquo;
        </p>
      )}
    </div>
  );
}
