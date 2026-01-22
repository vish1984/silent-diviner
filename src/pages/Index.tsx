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

  const { isListening, isSupported, lastTranscript, startListening, clearTranscript } = useSpeechRecognition();

  // Process transcript when it changes
  useEffect(() => {
    if (lastTranscript) {
      const parsed = parseKeywords(lastTranscript);
      
      if (parsed.success) {
        vibrateMatch();
        setResult(parsed);
      } else if (parsed.partialMatch) {
        vibrateError();
        // Only show error if we don't have a successful result displayed
        if (!result?.success) {
          setResult(parsed);
        }
      }
      clearTranscript();
    }
  }, [lastTranscript, vibrateMatch, vibrateError, clearTranscript, result?.success]);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    
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

  const handleTouchEnd = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Clear result on tap
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
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
        <p className="text-[#444444] text-2xl font-light tracking-wide">
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
      {/* Listening indicator - small text at bottom */}
      {isListening && (
        <p className="absolute bottom-8 text-[#333333] text-xl font-light tracking-widest uppercase">
          listening
        </p>
      )}

      {result && (
        <div className="text-left px-8">
          {result.success && result.resultA && result.resultB ? (
            <div className="space-y-10">
              <div className="space-y-2">
                <p className="text-white text-4xl font-light tracking-[0.2em]">
                  {result.resultA.label}: {result.resultA.date} - {result.resultA.zodiac}
                </p>
                <div className="text-white text-xl font-light leading-relaxed">
                  <p>• PER: {result.resultA.reading.per}</p>
                  <p>• PST: {result.resultA.reading.pst}</p>
                  <p>• PRE: {result.resultA.reading.pre}</p>
                  <p>• FTR: {result.resultA.reading.ftr}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-white text-4xl font-light tracking-[0.2em]">
                  {result.resultB.label}: {result.resultB.date} - {result.resultB.zodiac}
                </p>
                <div className="text-white text-xl font-light leading-relaxed">
                  <p>• PER: {result.resultB.reading.per}</p>
                  <p>• PST: {result.resultB.reading.pst}</p>
                  <p>• PRE: {result.resultB.reading.pre}</p>
                  <p>• FTR: {result.resultB.reading.ftr}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {result.partialMatch && (
                <p className="text-[#333333] text-xl font-light tracking-wider uppercase">
                  Heard: {Object.values(result.partialMatch).filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-[#444444] text-xl font-light tracking-wider">
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
