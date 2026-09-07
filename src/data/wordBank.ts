export interface WordItem {
  word: string;
  category: string;
  hint: string;
}

export const WORD_CATEGORIES = [
  'All Categories',
  'Technology',
  'Science & Space',
  'Animals & Nature',
  'Geography',
  'Food & Cooking',
  'Movies & Pop Culture',
];

export const WORD_BANK: WordItem[] = [
  // Technology
  { word: 'ALGORITHM', category: 'Technology', hint: 'Step-by-step instructions for computing' },
  { word: 'CLOUDFLARE', category: 'Technology', hint: 'Web performance and security network' },
  { word: 'DATABASE', category: 'Technology', hint: 'Structured collection of stored data' },
  { word: 'JAVASCRIPT', category: 'Technology', hint: 'Popular web programming language' },
  { word: 'CYBERSECURITY', category: 'Technology', hint: 'Protection of systems from digital attacks' },
  { word: 'COMPILER', category: 'Technology', hint: 'Transforms source code into machine code' },
  { word: 'INTELLIGENCE', category: 'Technology', hint: 'Ability of machines to simulate human thinking' },
  { word: 'ENCRYPTION', category: 'Technology', hint: 'Encoding information to prevent unauthorized access' },

  // Science & Space
  { word: 'ASTRONOMY', category: 'Science & Space', hint: 'Study of celestial bodies and space' },
  { word: 'TELESCOPE', category: 'Science & Space', hint: 'Instrument to observe distant objects' },
  { word: 'GRAVITATION', category: 'Science & Space', hint: 'Natural force that attracts masses' },
  { word: 'SUPERNOVA', category: 'Science & Space', hint: 'Explosion of a star at the end of its life' },
  { word: 'PHOTOSYNTHESIS', category: 'Science & Space', hint: 'Process plants use to convert light into energy' },
  { word: 'ATMOSPHERE', category: 'Science & Space', hint: 'Layer of gases surrounding a planet' },

  // Animals & Nature
  { word: 'CHIMPANZEE', category: 'Animals & Nature', hint: 'Highly intelligent primate species' },
  { word: 'FLAMINGO', category: 'Animals & Nature', hint: 'Pink wading bird with long legs' },
  { word: 'RHINOCEROS', category: 'Animals & Nature', hint: 'Large herbivorous mammal with thick skin and horns' },
  { word: 'ALLIGATOR', category: 'Animals & Nature', hint: 'Large crocodilian reptile' },
  { word: 'KANGAROO', category: 'Animals & Nature', hint: 'Marsupial famous for leaping' },
  { word: 'CHAMELEON', category: 'Animals & Nature', hint: 'Lizard known for changing color' },

  // Geography
  { word: 'AMSTERDAM', category: 'Geography', hint: 'Capital city of the Netherlands' },
  { word: 'PHILIPPINES', category: 'Geography', hint: 'Archipelagic country in Southeast Asia' },
  { word: 'KILIMANJARO', category: 'Geography', hint: 'Highest mountain peak in Africa' },
  { word: 'REYKJAVIK', category: 'Geography', hint: 'Capital city of Iceland' },
  { word: 'MADAGASCAR', category: 'Geography', hint: 'Large island nation off East Africa' },
  { word: 'HIMALAYAS', category: 'Geography', hint: 'Major mountain range in Asia' },

  // Food & Cooking
  { word: 'CHOCOLATE', category: 'Food & Cooking', hint: 'Sweet treat made from roasted cocoa beans' },
  { word: 'CAPPUCCINO', category: 'Food & Cooking', hint: 'Espresso topped with steamed milk foam' },
  { word: 'GUACAMOLE', category: 'Food & Cooking', hint: 'Avocado-based dip origin from Mexico' },
  { word: 'SPAGHETTI', category: 'Food & Cooking', hint: 'Long, thin Italian pasta' },
  { word: 'CROISSANT', category: 'Food & Cooking', hint: 'Flaky, buttery French pastry' },

  // Movies & Pop Culture
  { word: 'BLOCKBUSTER', category: 'Movies & Pop Culture', hint: 'Highly popular and successful movie' },
  { word: 'HOLLYWOOD', category: 'Movies & Pop Culture', hint: 'Famous district associated with American cinema' },
  { word: 'SUPERHERO', category: 'Movies & Pop Culture', hint: 'Hero with extraordinary superpowers' },
  { word: 'CINEMATOGRAPHY', category: 'Movies & Pop Culture', hint: 'Art of camera work and motion picture photography' },
];

export function getRandomWord(category?: string): WordItem {
  let filtered = WORD_BANK;
  if (category && category !== 'All Categories') {
    filtered = WORD_BANK.filter((item) => item.category === category);
  }
  if (filtered.length === 0) filtered = WORD_BANK;
  const randomIndex = Math.floor(Math.random() * filtered.length);
  return filtered[randomIndex];
}
