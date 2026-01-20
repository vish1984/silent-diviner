import { useState, useRef, useCallback, useEffect } from 'react';

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
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export const useSpeechRecognition = (onTranscript: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript;
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        // Silently handle errors - don't show anything
        if (event.error === 'not-allowed') {
          setIsListening(false);
          isActiveRef.current = false;
        }
      };

      recognition.onend = () => {
        // Automatically restart if we're supposed to be listening
        if (isActiveRef.current) {
          try {
            recognition.start();
          } catch (e) {
            // Ignore errors on restart
          }
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        isActiveRef.current = false;
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isActiveRef.current) {
      try {
        isActiveRef.current = true;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        // Already started, ignore
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      isActiveRef.current = false;
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
};
