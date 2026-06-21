const FOOD_KEYWORDS: Record<string, string[]> = {
  strawberry: ['strawberry', 'strawberries', 'fresa', 'fresas'],
  tomato:     ['tomato', 'tomatoes', 'tomate', 'tomates', 'jitomate', 'jitomates'],
  lettuce:    ['lettuce', 'lechuga', 'lechugas'],
  apple:      ['apple', 'apples', 'manzana', 'manzanas'],
};

const VALID_FOODS = ['strawberry', 'tomato', 'lettuce', 'apple'] as const;

/** Resolve a food id from spoken transcript (English or Spanish). */
export function resolveFoodFromTranscript(
  transcript: string,
  fallbackFood: string,
): string {
  const normalized = transcript.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');

  for (const food of VALID_FOODS) {
    for (const keyword of FOOD_KEYWORDS[food]) {
      if (normalized.includes(keyword.normalize('NFD').replace(/\p{M}/gu, ''))) {
        return food;
      }
    }
  }

  return VALID_FOODS.includes(fallbackFood as (typeof VALID_FOODS)[number])
    ? fallbackFood
    : 'strawberry';
}

export { VALID_FOODS };
