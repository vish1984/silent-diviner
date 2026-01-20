import { useState, useCallback, useRef, useEffect } from 'react';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { parseKeywords, ParseResult } from '@/lib/keywordParser';

const Index = () => {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { vibrateReady, vibrateMatch, vibrateError } = useHapticFeedback();

  // Keep screen awake
  useWakeLock();

  const handleTranscript = useCallback((transcript: string) => {
    const parsed = parseKeywords(transcript);
    
    if (parsed.success) {
      vibrateMatch();
      setResult(parsed);
    } else if (parsed.partialMatch) {
      vibrateError();
      setResult(parsed);
    }
    // If no match at all, don't update display - keep listening silently
  }, [vibrateMatch, vibrateError]);

  const { isListening, isSupported, startListening } = useSpeechRecognition(handleTranscript);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    // If already activated, a tap clears the result
    if (isActivated && result) {
      setResult(null);
      return;
    }

    // Long press to activate
    if (!isActivated) {
      longPressTimerRef.current = setTimeout(() => {
        vibrateReady();
        setIsActivated(true);
        startListening();
      }, 500);
    }
  }, [isActivated, result, vibrateReady, startListening]);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Clear result on tap
  const handleClick = useCallback(() => {
    if (isActivated && result) {
      setResult(null);
    }
  }, [isActivated, result]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  if (!isSupported) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-[#444444] text-sm font-light tracking-wide">
          Speech recognition not supported
        </p>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black flex items-center justify-center select-none touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onClick={handleClick}
      style={{ 
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        cursor: 'default'
      }}
    >
      {result && (
        <div className="text-center px-8">
          {result.success ? (
            <div className="space-y-4">
              <p className="text-[#444444] text-2xl font-light tracking-[0.3em]">
                {result.resultA}
              </p>
              <p className="text-[#444444] text-2xl font-light tracking-[0.3em]">
                {result.resultB}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {result.partialMatch && (
                <p className="text-[#333333] text-xs font-light tracking-wider uppercase">
                  Heard: {Object.values(result.partialMatch).filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-[#444444] text-xs font-light tracking-wider">
                {result.error}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
