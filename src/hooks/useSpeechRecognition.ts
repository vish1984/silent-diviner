import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  parseStreamingTranscript, 
  scanAlternatives, 
  createEmptySlots, 
  LockedSlots, 
  StreamingParseResult 
} from '@/lib/streamingKeywordParser';
import { ParseResult } from '@/lib/keywordParser';

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onspeechend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseSpeechRecognitionOptions {
  onMatch: (result: ParseResult) => void;
  onPartialUpdate?: (slots: LockedSlots) => void;
}

export const useSpeechRecognition = ({ onMatch, onPartialUpdate }: UseSpeechRecognitionOptions) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<LockedSlots>(createEmptySlots());
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isActiveRef = useRef(false);
  const slotsRef = useRef<LockedSlots>(createEmptySlots());
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(Date.now());
  const matchTriggeredRef = useRef(false);

  // Clear silence timer
  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // Force restart recognition (aggressive restart for noise handling)
  const forceRestart = useCallback(() => {
    if (recognitionRef.current && isActiveRef.current) {
      console.log('[SPEECH] Force restart - clearing buffer');
      try {
        recognitionRef.current.abort();
        // Small delay before restarting
        setTimeout(() => {
          if (isActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log('[SPEECH] Restart error (expected):', e);
            }
          }
        }, 100);
      } catch (e) {
        console.log('[SPEECH] Abort error:', e);
      }
    }
  }, []);

  // Start 10-second silence timer for aggressive restart
  const startSilenceTimer = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      const timeSinceLastSpeech = Date.now() - lastSpeechTimeRef.current;
      if (timeSinceLastSpeech >= 10000 && isActiveRef.current) {
        console.log('[SPEECH] 10s silence - forcing restart');
        forceRestart();
      }
    }, 10000);
  }, [clearSilenceTimer, forceRestart]);

  // Reset slots
  const resetSlots = useCallback(() => {
    slotsRef.current = createEmptySlots();
    setLockedSlots(createEmptySlots());
    matchTriggeredRef.current = false;
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true; // CRITICAL: Enable interim results for instant detection
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 5; // Get multiple alternatives for better matching

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Don't process if we already triggered a match
        if (matchTriggeredRef.current) return;

        lastSpeechTimeRef.current = Date.now();
        startSilenceTimer();

        // Process ALL results (both interim and final)
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          
          // Build alternatives array from this result
          const alternatives: { transcript: string; confidence: number }[] = [];
          for (let j = 0; j < result.length; j++) {
            alternatives.push({
              transcript: result[j].transcript,
              confidence: result[j].confidence || 0
            });
          }

          // Scan ALL alternatives for matches (noise gate bypass)
          const altMatch = scanAlternatives(alternatives);
          if (altMatch) {
            // Lock this slot if not already locked
            if (altMatch.category === 'trimester' && !slotsRef.current.trimester) {
              slotsRef.current.trimester = altMatch.canonical;
              console.log('[SLOT LOCKED] Trimester:', altMatch.canonical, 'from word:', altMatch.word);
            }
            if (altMatch.category === 'red' && !slotsRef.current.red) {
              slotsRef.current.red = altMatch.canonical;
              console.log('[SLOT LOCKED] Red:', altMatch.canonical, 'from word:', altMatch.word);
            }
            if (altMatch.category === 'economic' && !slotsRef.current.economic) {
              slotsRef.current.economic = altMatch.canonical;
              console.log('[SLOT LOCKED] Economic:', altMatch.canonical, 'from word:', altMatch.word);
            }
          }

          // Also scan the main transcript
          const mainTranscript = result[0]?.transcript || '';
          const streamResult = parseStreamingTranscript(mainTranscript, slotsRef.current);
          slotsRef.current = streamResult.lockedSlots;
          
          // Update UI with current locked slots
          setLockedSlots({ ...slotsRef.current });
          onPartialUpdate?.(slotsRef.current);

          // Check if all 3 slots are locked - TRIGGER IMMEDIATELY
          if (slotsRef.current.trimester && slotsRef.current.red && slotsRef.current.economic) {
            if (!matchTriggeredRef.current) {
              matchTriggeredRef.current = true;
              console.log('[MATCH COMPLETE] All 3 slots locked!', slotsRef.current);
              
              // Build canonical transcript for final calculation
              const canonicalTranscript = `${slotsRef.current.trimester} ${slotsRef.current.red} ${slotsRef.current.economic}`;
              const finalStreamResult = parseStreamingTranscript(canonicalTranscript, createEmptySlots());
              
              if (finalStreamResult.result) {
                // Trigger callback IMMEDIATELY - this is the exact millisecond
                onMatch(finalStreamResult.result);
              }
            }
            return; // Stop processing
          }
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.log('[SPEECH] Error:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          isActiveRef.current = false;
        } else if (isActiveRef.current) {
          // Auto-restart on other errors (network, audio, etc.)
          console.log('[SPEECH] Auto-restarting after error');
          setTimeout(() => {
            if (isActiveRef.current) {
              try {
                recognition.start();
              } catch (e) {
                console.log('[SPEECH] Restart after error failed:', e);
              }
            }
          }, 100);
        }
      };

      recognition.onend = () => {
        console.log('[SPEECH] Ended, isActive:', isActiveRef.current);
        if (isActiveRef.current) {
          // Immediate restart - keep listening
          try {
            recognition.start();
            console.log('[SPEECH] Restarted successfully');
          } catch (e) {
            console.log('[SPEECH] Restart error:', e);
            // Try again after short delay
            setTimeout(() => {
              if (isActiveRef.current) {
                try {
                  recognition.start();
                } catch (e2) {
                  console.log('[SPEECH] Delayed restart also failed:', e2);
                }
              }
            }, 100);
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        isActiveRef.current = false;
        recognitionRef.current.abort();
      }
    };
  }, [onMatch, onPartialUpdate, startSilenceTimer, clearSilenceTimer]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isActiveRef.current) {
      try {
        isActiveRef.current = true;
        matchTriggeredRef.current = false;
        resetSlots();
        recognitionRef.current.start();
        setIsListening(true);
        lastSpeechTimeRef.current = Date.now();
        startSilenceTimer();
        console.log('[SPEECH] Started listening');
      } catch (e) {
        console.log('[SPEECH] Start error:', e);
      }
    }
  }, [resetSlots, startSilenceTimer]);

  const stopListening = useCallback(() => {
    console.log('[SPEECH] Stopping');
    clearSilenceTimer();
    if (recognitionRef.current) {
      isActiveRef.current = false;
      recognitionRef.current.abort();
      setIsListening(false);
    }
  }, [clearSilenceTimer]);

  const clearSlots = useCallback(() => {
    resetSlots();
  }, [resetSlots]);

  return {
    isListening,
    isSupported,
    lockedSlots,
    startListening,
    stopListening,
    clearSlots,
  };
};
