// Keyword dictionaries
const TRIMESTER: Record<string, number> = {
  'health': 0,
  'character': 4,
  'personality': 8,
};

const RED_CATEGORY: Record<string, number> = {
  'love': 1,
  'romance': 2,
  'partnership': 3,
  'relationships': 4,
  'relationship': 4,
};

const ECONOMIC_CATEGORY: Record<string, number> = {
  'job': 2,
  'work': 6,
  'money': 10,
  'career': 14,
  'finance': 18,
  'success': 22,
  'profession': 26,
  'occupation': 30,
};

// Zodiac transitions (day of month when sign changes)
const ZODIAC_TRANSITIONS = [
  { month: 1, day: 20, sign: 'AQUARIUS' },
  { month: 2, day: 18, sign: 'PISCES' },
  { month: 3, day: 20, sign: 'ARIES' },
  { month: 4, day: 20, sign: 'TAURUS' },
  { month: 5, day: 20, sign: 'GEMINI' },
  { month: 6, day: 20, sign: 'CANCER' },
  { month: 7, day: 22, sign: 'LEO' },
  { month: 8, day: 22, sign: 'VIRGO' },
  { month: 9, day: 22, sign: 'LIBRA' },
  { month: 10, day: 22, sign: 'SCORPIO' },
  { month: 11, day: 22, sign: 'SAGITTARIUS' },
  { month: 12, day: 20, sign: 'CAPRICORN' },
];

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const ZODIAC_KEYWORDS: Record<string, string> = {
  'ARIES': 'Restless, Guarded, Impulsive, Perfectionist',
  'TAURUS': 'Stubborn, Grounded, Loyal, Creative',
  'GEMINI': 'Dual, Intellectual, Adaptive, Searching',
  'CANCER': 'Intuitive, Nostalgic, Empathetic, Protective',
  'LEO': 'Proud, Protective, Playful, Intense',
  'VIRGO': 'Analytical, Organized, Sensitive, Critical',
  'LIBRA': 'Balanced, Indecisive, Diplomatic, Refined',
  'SCORPIO': 'Magnetic, Transformative, Private, Observant',
  'SAGITTARIUS': 'Philosophical, Honest, Resilient, Independent',
  'CAPRICORN': 'Strategic, Self-reliant, Ambitious, Humorous',
  'AQUARIUS': 'Visionary, Independent, Altruistic, Rebellious',
  'PISCES': 'Dreamer, Fluid, Chameleonic, Soulful',
};

export interface ResultLine {
  label: string;
  date: string;
  zodiac: string;
  keywords: string;
}

export interface ParseResult {
  success: boolean;
  resultA?: ResultLine;
  resultB?: ResultLine;
  error?: string;
  partialMatch?: {
    trimester?: string;
    redCategory?: string;
    economicCategory?: string;
  };
}

interface FoundKeyword {
  word: string;
  category: 'trimester' | 'red' | 'economic';
  value: number;
  position: number;
}

function findKeywords(transcript: string): FoundKeyword[] {
  const words = transcript.toLowerCase();
  const found: FoundKeyword[] = [];

  // Find all keyword matches with their positions
  for (const [keyword, value] of Object.entries(TRIMESTER)) {
    const pos = words.indexOf(keyword);
    if (pos !== -1) {
      found.push({ word: keyword, category: 'trimester', value, position: pos });
    }
  }

  for (const [keyword, value] of Object.entries(RED_CATEGORY)) {
    const pos = words.indexOf(keyword);
    if (pos !== -1) {
      found.push({ word: keyword, category: 'red', value, position: pos });
    }
  }

  for (const [keyword, value] of Object.entries(ECONOMIC_CATEGORY)) {
    const pos = words.indexOf(keyword);
    if (pos !== -1) {
      found.push({ word: keyword, category: 'economic', value, position: pos });
    }
  }

  return found;
}

function getZodiacSign(month: number, day: number): string {
  // Handle month overflow for zodiac calculation
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let adjustedMonth = month;
  let adjustedDay = day;
  
  // Normalize for zodiac lookup
  while (adjustedDay > daysInMonth[adjustedMonth - 1]) {
    adjustedDay -= daysInMonth[adjustedMonth - 1];
    adjustedMonth = adjustedMonth >= 12 ? 1 : adjustedMonth + 1;
  }

  // Find the zodiac sign based on transition limits
  for (let i = ZODIAC_TRANSITIONS.length - 1; i >= 0; i--) {
    const transition = ZODIAC_TRANSITIONS[i];
    if (adjustedMonth === transition.month && adjustedDay >= transition.day) {
      return transition.sign;
    }
    if (adjustedMonth > transition.month || (adjustedMonth === 1 && transition.month === 12)) {
      if (adjustedMonth === 1 && transition.month === 12) {
        if (adjustedDay < 20) return 'CAPRICORN';
        return 'AQUARIUS';
      }
      return transition.sign;
    }
  }

  return 'CAPRICORN';
}

function formatResult(month: number, day: number, label: string): ResultLine {
  // Display raw month and day without overflow handling
  const monthName = MONTH_NAMES[month - 1];
  const zodiac = getZodiacSign(month, day);
  const keywords = ZODIAC_KEYWORDS[zodiac] || '';
  
  return {
    label,
    date: `${monthName} ${day}`,
    zodiac,
    keywords,
  };
}

export function parseKeywords(transcript: string): ParseResult {
  const found = findKeywords(transcript);
  
  const trimester = found.find(k => k.category === 'trimester');
  const redCategory = found.find(k => k.category === 'red');
  const economicCategory = found.find(k => k.category === 'economic');

  // Check for partial matches
  const hasAny = trimester || redCategory || economicCategory;
  const hasAll = trimester && redCategory && economicCategory;

  if (!hasAny) {
    return { success: false };
  }

  if (!hasAll) {
    const missing: string[] = [];
    if (!trimester) missing.push('Trimester (Health/Character/Personality)');
    if (!redCategory) missing.push('Red (Love/Romance/Partnership/Relationships)');
    if (!economicCategory) missing.push('Economic (Job/Work/Money/Career/Finance/Success/Profession/Occupation)');

    return {
      success: false,
      error: `Missing: ${missing.join(', ')}`,
      partialMatch: {
        trimester: trimester?.word,
        redCategory: redCategory?.word,
        economicCategory: economicCategory?.word,
      },
    };
  }

  // Calculate month (1-12)
  const month = trimester.value + redCategory.value;
  
  // Calculate base day
  let baseDay = economicCategory.value;
  
  // Sort keywords by position to determine order
  const sortedKeywords = [trimester, redCategory, economicCategory].sort((a, b) => a.position - b.position);
  
  // Check if Red category is the THIRD keyword (index 2)
  if (sortedKeywords[2].category === 'red') {
    baseDay += 2;
  }

  // Result A (Right Page): Day as is
  const resultA = formatResult(month, baseDay, 'R');
  
  // Result B (Left Page): Day - 1
  const resultB = formatResult(month, baseDay - 1, 'L');

  return {
    success: true,
    resultA,
    resultB,
  };
}
