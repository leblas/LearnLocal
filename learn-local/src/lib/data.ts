export interface FoodLesson {
  id: string;
  name: string;
  emoji: string;
  origin: {
    region: string;
    country: string;
    story: string;
    farmName: string;
    distance: string;
    travelTime: string;
  };
  environmental: {
    carbonScore: number; // 1-10 (10 = best)
    waterUsage: string;
    seasonality: string;
    pesticides: string;
    impact: string;
    tip: string;
  };
  community: {
    jobs: number;
    familyFarms: number;
    localEconomy: string;
    story: string;
  };
  localAction: {
    title: string;
    description: string;
    icon: string;
    difficulty: 'Easy' | 'Medium' | 'Adventure';
    reward: number; // XP points
  };
  funFacts: string[];
  nutritionHighlights: string[];
  badges: string[];
}

export const foodDatabase: Record<string, FoodLesson> = {
  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    emoji: '🍓',
    origin: {
      region: 'Watsonville, California',
      country: 'USA',
      story:
        'These bright red beauties grew just 12 miles from your local farmers market! California\'s Pajaro Valley has the perfect coastal climate — cool mornings and warm afternoons — that makes strawberries burst with sweetness. Farmers here have been growing strawberries since the 1900s.',
      farmName: 'Sunrise Organic Farms',
      distance: '12 miles away',
      travelTime: 'Picked this morning!',
    },
    environmental: {
      carbonScore: 8,
      waterUsage: '1 pint uses 24 gallons of water',
      seasonality: 'Peak: April – June',
      pesticides: 'Certified organic — no synthetic pesticides',
      impact:
        'Buying local strawberries cuts transport emissions by 85% compared to imported berries. Strawberries also support pollinator habitats when grown organically.',
      tip: 'Eat strawberries in season (spring!) for the best flavor AND the lowest environmental impact.',
    },
    community: {
      jobs: 450,
      familyFarms: 38,
      localEconomy: '$2.3M',
      story:
        'Local strawberry farms in your region employ over 450 workers, many of whom are part of multi-generational farming families. When you buy local, $0.78 of every dollar stays in your community!',
    },
    localAction: {
      title: 'Visit a U-Pick Strawberry Farm!',
      description:
        'Find a local u-pick farm this weekend. You\'ll meet the farmers, learn how strawberries grow, and pick the freshest berries straight from the plant. Many farms offer guided tours for kids!',
      icon: '🏡',
      difficulty: 'Adventure',
      reward: 150,
    },
    funFacts: [
      'Strawberries are the only fruit with seeds on the outside — a single berry has about 200 seeds!',
      'Strawberries belong to the rose family. Smell one closely and you\'ll notice the floral connection!',
      'Ancient Romans believed strawberries could cure everything from fevers to sore throats.',
      'It takes 2–3 weeks from flower to ripe strawberry.',
    ],
    nutritionHighlights: [
      'Packed with Vitamin C — one cup has more than an orange!',
      'Rich in antioxidants that keep your heart healthy',
      'High in fiber for a happy digestive system',
      'Only 49 calories per cup',
    ],
    badges: ['Local Hero', 'Eco Warrior', 'Season Seeker'],
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    emoji: '🍎',
    origin: {
      region: 'Sonoma County, California',
      country: 'USA',
      story:
        'These crisp apples come from the rolling hills of Sonoma County, just 45 miles away! The region\'s warm days and cool nights are perfect for developing that signature sweet-tart crunch.',
      farmName: 'Heritage Orchard Co.',
      distance: '45 miles away',
      travelTime: 'Harvested 2 days ago',
    },
    environmental: {
      carbonScore: 7,
      waterUsage: '1 apple uses about 18 gallons of water',
      seasonality: 'Peak: August – November',
      pesticides: 'Integrated Pest Management — minimal spray',
      impact:
        'Local apples travel far fewer miles than imported varieties. Apple trees also provide year-round habitat for birds and beneficial insects.',
      tip: 'Store apples in the fridge to make them last up to 6 weeks — reducing food waste!',
    },
    community: {
      jobs: 280,
      familyFarms: 22,
      localEconomy: '$1.8M',
      story:
        'Apple orchards in this region have been family-owned for generations. Harvest season brings the whole community together for festivals, cider pressing, and school field trips.',
    },
    localAction: {
      title: 'Make Apple Cider at Home',
      description:
        'Grab a bag of local apples and learn to press fresh apple cider. Many community centers and libraries host fall cider-making workshops!',
      icon: '🧃',
      difficulty: 'Medium',
      reward: 100,
    },
    funFacts: [
      'There are over 7,500 varieties of apples grown worldwide!',
      'Apple trees can live for 100 years or more.',
      'Apples float in water because they\'re 25% air.',
      'It takes about 36 apples to make one gallon of cider.',
    ],
    nutritionHighlights: [
      'High in quercetin, linked to brain health',
      'Great source of pectin fiber',
      'Contains Vitamin K for bone health',
      'Natural energy boost from fructose',
    ],
    badges: ['Orchard Explorer', 'Tradition Keeper', 'Crunch Champion'],
  },
  tomato: {
    id: 'tomato',
    name: 'Tomato',
    emoji: '🍅',
    origin: {
      region: 'San Joaquin Valley, California',
      country: 'USA',
      story:
        'Originally from the Andes mountains of South America, tomatoes have found a second home in California\'s sunny San Joaquin Valley. Your tomato was grown just 30 miles away under the warm Central Valley sun!',
      farmName: 'Valley Sun Growers',
      distance: '30 miles away',
      travelTime: 'Vine-ripened yesterday',
    },
    environmental: {
      carbonScore: 9,
      waterUsage: '1 pound uses about 22 gallons of water',
      seasonality: 'Peak: July – September',
      pesticides: 'Low-spray with beneficial insect release',
      impact:
        'Locally grown tomatoes are one of the most eco-friendly choices you can make. They\'re high-yield, support soil health when rotated, and have minimal packaging.',
      tip: 'Never refrigerate fresh tomatoes — it kills their flavor! Keep them on the counter.',
    },
    community: {
      jobs: 320,
      familyFarms: 15,
      localEconomy: '$3.1M',
      story:
        'Tomato farming is woven into the cultural fabric of Central Valley communities, many of which trace their heritage to farmworker families who helped build California\'s agricultural legacy.',
    },
    localAction: {
      title: 'Grow Your Own Tomato Plant',
      description:
        'Start a tomato plant from seed on your windowsill! Most libraries have seed libraries where you can get free heirloom tomato seeds. Watch the magic of growing your own food!',
      icon: '🌱',
      difficulty: 'Easy',
      reward: 80,
    },
    funFacts: [
      'Tomatoes are technically a fruit (botanically a berry!), but are used as a vegetable in cooking.',
      'There are over 10,000 known tomato varieties.',
      'The world\'s largest tomato weighed over 10 pounds!',
      'Tomatoes are about 95% water.',
    ],
    nutritionHighlights: [
      'Rich in lycopene — a powerful antioxidant',
      'Excellent source of Vitamin C',
      'Contains potassium for heart health',
      'Anti-inflammatory properties',
    ],
    badges: ['Garden Guru', 'Vitamin C Champ', 'Seed Saver'],
  },
};

export const userProgress = {
  xp: 340,
  level: 3,
  levelName: 'Sprout Explorer',
  nextLevelXp: 500,
  lessonsCompleted: 7,
  badgesEarned: ['Local Hero', 'Eco Warrior', 'Garden Guru', 'Seed Saver'],
  streak: 5,
  communityRank: 42,
};

export const recentLessons = [
  { food: '🍓', name: 'Strawberry', origin: 'Watsonville, CA', date: 'Today', xp: 50 },
  { food: '🍅', name: 'Tomato', origin: 'Local greenhouse', date: 'Yesterday', xp: 50 },
  { food: '🥬', name: 'Lettuce', origin: 'Community garden', date: '3 days ago', xp: 50 },
];

export const communityFeed = [
  {
    id: 1,
    user: 'Maya R.',
    avatar: '🌻',
    action: 'visited Sunrise Organic Farms',
    food: '🍓',
    time: '2 hours ago',
    xp: 150,
  },
  {
    id: 2,
    user: 'Theo K.',
    avatar: '🦋',
    action: 'learned about local apples',
    food: '🍎',
    time: '4 hours ago',
    xp: 100,
  },
  {
    id: 3,
    user: 'Sofia M.',
    avatar: '🌺',
    action: 'grew their first tomato',
    food: '🍅',
    time: '1 day ago',
    xp: 80,
  },
  {
    id: 4,
    user: 'Liam J.',
    avatar: '🐝',
    action: 'attended farmers market tour',
    food: '🌽',
    time: '2 days ago',
    xp: 200,
  },
  {
    id: 5,
    user: 'Priya S.',
    avatar: '🌿',
    action: 'completed Eco Warrior challenge',
    food: '🥕',
    time: '3 days ago',
    xp: 120,
  },
];

export const leaderboard = [
  { rank: 1, user: 'Maya R.', avatar: '🌻', xp: 1240, badge: '🥇' },
  { rank: 2, user: 'Sofia M.', avatar: '🌺', xp: 980, badge: '🥈' },
  { rank: 3, user: 'Theo K.', avatar: '🦋', xp: 760, badge: '🥉' },
  { rank: 4, user: 'Liam J.', avatar: '🐝', xp: 650, badge: '🏅' },
  { rank: 5, user: 'You', avatar: '⭐', xp: 340, badge: '🌱', isYou: true },
];
