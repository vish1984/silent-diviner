// Streaming Keyword Parser - Real-time slot locking for stage performance

import { parseKeywords, ParseResult } from './keywordParser';

// Ultimate Phonetic Dictionary - comprehensive phonetic sounding words
const TRIMESTER_ALIASES: Record<string, string> = {
  'health': 'health', 'helth': 'health', 'helt': 'health', 'held': 'health', 
  'heald': 'health', 'halth': 'health',
  'character': 'character', 'karakter': 'character', 'charactor': 'character', 
  'charakter': 'character', 'carector': 'character', 'carekter': 'character',
  'personality': 'personality', 'personelity': 'personality', 'persanality': 'personality', 
  'persnality': 'personality', 'personaliti': 'personality',
};

const RED_ALIASES: Record<string, string> = {
  'love': 'love', 'luv': 'love', 'lav': 'love', 'loove': 'love', 'lobe': 'love',
  'romance': 'romance', 'romans': 'romance', 'romanss': 'romance', 'romanse': 'romance',
  'partnership': 'partnership', 'partnarship': 'partnership',
  'relationship': 'relationships', 'relationships': 'relationships', 'relashanship': 'relationships', 
  'relashanships': 'relationships',
};

const ECONOMIC_ALIASES: Record<string, string> = {
  'job': 'job', 'jaab': 'job', 'jobe': 'job', 'jab': 'job',
  'work': 'work', 'vork': 'work', 'werk': 'work', 'wok': 'work',
  'money': 'money', 'mony': 'money', 'mani': 'money', 'munny': 'money',
  'career': 'career', 'carrier': 'career', 'karrier': 'career', 'carrer': 'career', 
  'carear': 'career', 'karir': 'career', 'kareer': 'career', 'karyar': 'career', 'careyer': 'career',
  'finance': 'finance', 'finans': 'finance', 'finence': 'finance', 'finanss': 'finance',
  'success': 'success', 'sakses': 'success', 'sucses': 'success', 'suksess': 'success', 'succees': 'success',
  'profession': 'profession', 'proffession': 'profession', 'profesion': 'profession', 
  'prosession': 'profession', 'profeshion': 'profession',
  'occupation': 'occupation', 'ocupation': 'occupation', 'okupation': 'occupation', 'occupashion': 'occupation',
};

export interface LockedSlots {
  trimester: string | null;
  red: string | null;
  economic: string | null;
}

export interface StreamingParseResult {
  complete: boolean;
  lockedSlots: LockedSlots;
  result?: ParseResult;
}

// Check a single word against all alias dictionaries
function checkWordForMatch(word: string): { category: 'trimester' | 'red' | 'economic'; canonical: string } | null {
  const lowered = word.toLowerCase().trim();
  
  if (TRIMESTER_ALIASES[lowered]) {
    return { category: 'trimester', canonical: TRIMESTER_ALIASES[lowered] };
  }
  if (RED_ALIASES[lowered]) {
    return { category: 'red', canonical: RED_ALIASES[lowered] };
  }
  if (ECONOMIC_ALIASES[lowered]) {
    return { category: 'economic', canonical: ECONOMIC_ALIASES[lowered] };
  }
  
  return null;
}

// Scan ALL alternatives from speech recognition for matches
export function scanAlternatives(alternatives: { transcript: string; confidence: number }[]): { category: 'trimester' | 'red' | 'economic'; canonical: string; word: string } | null {
  for (const alt of alternatives) {
    const words = alt.transcript.toLowerCase().split(/\s+/);
    for (const word of words) {
      const match = checkWordForMatch(word);
      if (match) {
        return { ...match, word };
      }
    }
  }
  return null;
}

// Stream parser that locks slots as words are detected
export function parseStreamingTranscript(
  transcript: string, 
  currentSlots: LockedSlots
): StreamingParseResult {
  const words = transcript.toLowerCase().split(/\s+/);
  const newSlots = { ...currentSlots };
  
  // Scan each word and lock slots as we find them
  for (const word of words) {
    if (!newSlots.trimester && TRIMESTER_ALIASES[word]) {
      newSlots.trimester = TRIMESTER_ALIASES[word];
    }
    if (!newSlots.red && RED_ALIASES[word]) {
      newSlots.red = RED_ALIASES[word];
    }
    if (!newSlots.economic && ECONOMIC_ALIASES[word]) {
      newSlots.economic = ECONOMIC_ALIASES[word];
    }
  }
  
  // Check if all 3 slots are locked
  const complete = !!(newSlots.trimester && newSlots.red && newSlots.economic);
  
  if (complete) {
    // Build the canonical transcript for final calculation
    const canonicalTranscript = `${newSlots.trimester} ${newSlots.red} ${newSlots.economic}`;
    const result = parseKeywords(canonicalTranscript);
    return { complete: true, lockedSlots: newSlots, result };
  }
  
  return { complete: false, lockedSlots: newSlots };
}

// Reset slots
export function createEmptySlots(): LockedSlots {
  return { trimester: null, red: null, economic: null };
}
