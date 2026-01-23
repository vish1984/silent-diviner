// Ultimate Phonetic Dictionary - comprehensive phonetic sounding words
const TRIMESTER_ALIASES: Record<string, string> = {
  // HEALTH aliases
  'health': 'health', 'helth': 'health', 'helt': 'health', 'held': 'health', 
  'heald': 'health', 'halth': 'health',
  // CHARACTER aliases
  'character': 'character', 'karakter': 'character', 'charactor': 'character', 
  'charakter': 'character', 'carector': 'character', 'carekter': 'character',
  // PERSONALITY aliases
  'personality': 'personality', 'personelity': 'personality', 'persanality': 'personality', 
  'persnality': 'personality', 'personaliti': 'personality',
};

const RED_ALIASES: Record<string, string> = {
  // LOVE aliases
  'love': 'love', 'luv': 'love', 'lav': 'love', 'loove': 'love', 'lobe': 'love',
  // ROMANCE aliases
  'romance': 'romance', 'romans': 'romance', 'romanss': 'romance', 'romanse': 'romance',
  // PARTNERSHIP aliases
  'partnership': 'partnership', 'partnarship': 'partnership',
  // RELATIONSHIP aliases
  'relationship': 'relationships', 'relationships': 'relationships', 'relashanship': 'relationships', 
  'relashanships': 'relationships',
};

const ECONOMIC_ALIASES: Record<string, string> = {
  // JOB aliases
  'job': 'job', 'jaab': 'job', 'jobe': 'job', 'jab': 'job',
  // WORK aliases
  'work': 'work', 'vork': 'work', 'werk': 'work', 'wok': 'work',
  // MONEY aliases
  'money': 'money', 'mony': 'money', 'mani': 'money', 'munny': 'money',
  // CAREER aliases
  'career': 'career', 'carrier': 'career', 'karrier': 'career', 'carrer': 'career', 
  'carear': 'career', 'karir': 'career', 'kareer': 'career', 'karyar': 'career', 'careyer': 'career',
  // FINANCE aliases
  'finance': 'finance', 'finans': 'finance', 'finence': 'finance', 'finanss': 'finance',
  // SUCCESS aliases
  'success': 'success', 'sakses': 'success', 'sucses': 'success', 'suksess': 'success', 'succees': 'success',
  // PROFESSION aliases
  'profession': 'profession', 'proffession': 'profession', 'profesion': 'profession', 
  'prosession': 'profession', 'profeshion': 'profession',
  // OCCUPATION aliases
  'occupation': 'occupation', 'ocupation': 'occupation', 'okupation': 'occupation', 'occupashion': 'occupation',
};

// Canonical keyword values
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

// Zodiac transitions with Vedic names
const ZODIAC_TRANSITIONS = [
  { month: 1, day: 20, sign: 'AQUARIUS', vedic: 'Kumbh' },
  { month: 2, day: 18, sign: 'PISCES', vedic: 'Meen' },
  { month: 3, day: 20, sign: 'ARIES', vedic: 'Mesh' },
  { month: 4, day: 20, sign: 'TAURUS', vedic: 'Vrishabh' },
  { month: 5, day: 20, sign: 'GEMINI', vedic: 'Mithun' },
  { month: 6, day: 20, sign: 'CANCER', vedic: 'Kark' },
  { month: 7, day: 22, sign: 'LEO', vedic: 'Simha' },
  { month: 8, day: 22, sign: 'VIRGO', vedic: 'Kanya' },
  { month: 9, day: 22, sign: 'LIBRA', vedic: 'Tula' },
  { month: 10, day: 22, sign: 'SCORPIO', vedic: 'Vrishchik' },
  { month: 11, day: 22, sign: 'SAGITTARIUS', vedic: 'Dhanu' },
  { month: 12, day: 20, sign: 'CAPRICORN', vedic: 'Makar' },
];

const VEDIC_NAMES: Record<string, string> = {
  'ARIES': 'Mesh',
  'TAURUS': 'Vrishabh',
  'GEMINI': 'Mithun',
  'CANCER': 'Kark',
  'LEO': 'Simha',
  'VIRGO': 'Kanya',
  'LIBRA': 'Tula',
  'SCORPIO': 'Vrishchik',
  'SAGITTARIUS': 'Dhanu',
  'CAPRICORN': 'Makar',
  'AQUARIUS': 'Kumbh',
  'PISCES': 'Meen',
};

const MONTH_NAMES = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export interface ZodiacReading {
  per: string;
  pst: string;
  pre: string;
  ftr: string;
}

const ZODIAC_READINGS: Record<string, ZodiacReading> = {
  'ARIES': {
    per: 'Leader; impatient. Insecure about being "second best."',
    pst: 'Sudden move or physical scar changed life.',
    pre: 'Mars burnout. Shifting goals.',
    ftr: 'Rahu 11th. "Dark horse" deal brings wealth.',
  },
  'TAURUS': {
    per: 'Luxury lover; hoards emotions. Loyal until betrayed.',
    pst: 'Financial dip or lost heirloom haunts you.',
    pre: 'Venus Stagnant. Stuck in comfortable routine.',
    ftr: 'Jupiter Aspect. Property/Bhumi dispute won.',
  },
  'GEMINI': {
    per: 'Dual mind; restless. Talks to hide feelings.',
    pst: 'Broken friendship in teens broke trust.',
    pre: 'Mercury Retro. Family rift over misunderstood words.',
    ftr: 'Ketu Influence. Dropping major habit; reinvention.',
  },
  'CANCER': {
    per: 'Emotional sponge. Silent but remembers everything.',
    pst: 'Strong maternal struggle influenced your 20s.',
    pre: 'Moon anxiety. Obsessing over home/money.',
    ftr: "Shani's Grace. Long-term \"dosha\" or health issue clears.",
  },
  'LEO': {
    per: 'Gold heart; Ego armor. Needs validation.',
    pst: 'Public shame turned into greatest strength.',
    pre: 'Sun Peak pressure. Weight of the world on you.',
    ftr: 'Rahu Shadow. Beware "fake" mentor/shortcut.',
  },
  'VIRGO': {
    per: 'Over-thinker; notices dust first. Secret romantic.',
    pst: 'Education struggle due to distraction/focus.',
    pre: 'Mercury Sharp. Fixated on tiny work/health detail.',
    ftr: 'Mercury Direct. Side-hustle/hobby breakthrough.',
  },
  'LIBRA': {
    per: 'Peace-maker; hates Tamasha. Indecisive.',
    pst: 'Major sacrifice for partner went unrewarded.',
    pre: 'Venus Clouded. Heart vs Head in relationship.',
    ftr: "Shani's Justice. Legal/Karmic debt paid back to you.",
  },
  'SCORPIO': {
    per: 'Intense; sees lies. Hates forever.',
    pst: '"Near-death" or deep betrayal killed old self.',
    pre: 'Mars/Ketu Heat. Intense internal anger/target.',
    ftr: 'Hidden Treasure. Unexpected inheritance/secret money.',
  },
  'SAGITTARIUS': {
    per: 'Truth-seeker; blunt. Hates rules.',
    pst: 'Failed Yatra/journey taught life lesson.',
    pre: 'Jupiter Retro. Questioning faith/career path.',
    ftr: 'Foreign Gain. Success via Videsh connection.',
  },
  'CAPRICORN': {
    per: 'Old soul; serious exterior, lonely interior.',
    pst: 'Grew up too fast. Adult problems as a child.',
    pre: "Shani's Test. Slow progress; heavy weight.",
    ftr: 'Sade Sati Ending. Hard years over. Authority coming.',
  },
  'AQUARIUS': {
    per: 'Rebel. Thinks for world, forgets self.',
    pst: 'The "alien" in family/social circle.',
    pre: 'Rahu/Saturn Mix. Tech project/major insomnia.',
    ftr: 'Ketu Insight. Spiritual awakening changes direction.',
  },
  'PISCES': {
    per: 'Dreamer; escapes reality. Feels "used."',
    pst: 'Secret sorrow. Lost love or "what if" scenario.',
    pre: "Jupiter Drowning. Overwhelmed by others' emotions.",
    ftr: 'Venus Rising. Creative project brings fame/peace.',
  },
};

export interface ResultLine {
  label: string;
  date: string;
  zodiac: string;
  vedic: string;
  reading: ZodiacReading;
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

// Filler words to ignore
const FILLER_WORDS = new Set([
  'focus', 'on', 'the', 'and', 'your', 'a', 'an', 'is', 'are', 'was', 'were',
  'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
  'to', 'of', 'in', 'for', 'with', 'about', 'at', 'by', 'from', 'up', 'out',
  'into', 'over', 'after', 'that', 'this', 'these', 'those', 'it', 'its',
  'i', 'me', 'my', 'we', 'us', 'our', 'you', 'he', 'she', 'they', 'them',
]);

function findKeywords(transcript: string): FoundKeyword[] {
  const text = transcript.toLowerCase();
  const words = text.split(/\s+/).filter(w => !FILLER_WORDS.has(w));
  const found: FoundKeyword[] = [];
  const usedCategories = new Set<string>();

  // Check each word against fuzzy aliases
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    
    // Check Trimester aliases
    if (!usedCategories.has('trimester') && TRIMESTER_ALIASES[word]) {
      const canonical = TRIMESTER_ALIASES[word];
      const value = TRIMESTER[canonical];
      found.push({ word: canonical, category: 'trimester', value, position: text.indexOf(word) });
      usedCategories.add('trimester');
    }
    
    // Check Red Category aliases
    if (!usedCategories.has('red') && RED_ALIASES[word]) {
      const canonical = RED_ALIASES[word];
      const value = RED_CATEGORY[canonical];
      found.push({ word: canonical, category: 'red', value, position: text.indexOf(word) });
      usedCategories.add('red');
    }
    
    // Check Economic Category aliases
    if (!usedCategories.has('economic') && ECONOMIC_ALIASES[word]) {
      const canonical = ECONOMIC_ALIASES[word];
      const value = ECONOMIC_CATEGORY[canonical];
      found.push({ word: canonical, category: 'economic', value, position: text.indexOf(word) });
      usedCategories.add('economic');
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
  const vedic = VEDIC_NAMES[zodiac] || '';
  const reading = ZODIAC_READINGS[zodiac] || { per: '', pst: '', pre: '', ftr: '' };
  
  return {
    label,
    date: `${monthName} ${day}`,
    zodiac,
    vedic,
    reading,
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
