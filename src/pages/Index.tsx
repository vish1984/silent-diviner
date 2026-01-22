import { useState, useCallback, useRef, useEffect } from 'react';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { parseKeywords, ParseResult } from '@/lib/keywordParser';

const Index = () => {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const partialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  const { vibrateReady, vibrateMatch, vibrateError } = useHapticFeedback();

  // Keep screen awake
  useWakeLock();

  const { isListening, isSupported, lastTranscript, startListening, stopListening, clearTranscript } = useSpeechRecognition();

  // Clear partial timeout when we get a successful match
  const clearPartialTimeout = useCallback(() => {
    if (partialTimeoutRef.current) {
      clearTimeout(partialTimeoutRef.current);
      partialTimeoutRef.current = null;
    }
  }, []);

  // Process transcript when it changes
  useEffect(() => {
    if (lastTranscript) {
      const parsed = parseKeywords(lastTranscript);
      
      if (parsed.success) {
        vibrateMatch();
        setResult(parsed);
        clearPartialTimeout();
      } else if (parsed.partialMatch) {
        vibrateError();
        // Only show error if we don't have a successful result displayed
        if (!result?.success) {
          setResult(parsed);
          // Start 15-second timeout to clear partial match
          clearPartialTimeout();
          partialTimeoutRef.current = setTimeout(() => {
            setResult(prev => prev?.success ? prev : null);
          }, 15000);
        }
      }
      clearTranscript();
    }
  }, [lastTranscript, vibrateMatch, vibrateError, clearTranscript, result?.success, clearPartialTimeout]);

  // Handle double-tap for font size toggle
  const handleDoubleTap = useCallback(() => {
    setIsLargeFont(prev => !prev);
  }, []);

  // Handle long-press for hard reset
  const handleHardReset = useCallback(() => {
    vibrateReady();
    stopListening();
    setResult(null);
    setIsActivated(false);
    clearPartialTimeout();
  }, [vibrateReady, stopListening, clearPartialTimeout]);

  const handleTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    
    // Check for double-tap (within 300ms)
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      handleDoubleTap();
      lastTapRef.current = 0;
      return;
    }
    
    lastTapRef.current = now;
    
    // If already activated, a tap clears the result
    if (isActivated && result) {
      setResult(null);
      return;
    }

    // Long press to activate (or hard reset if already activated)
    longPressTimerRef.current = setTimeout(() => {
      if (isActivated) {
        // Hard reset
        handleHardReset();
      } else {
        // Activate
        vibrateReady();
        setIsActivated(true);
        startListening();
      }
    }, 500);
  }, [isActivated, result, vibrateReady, startListening, handleDoubleTap, handleHardReset]);

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
      if (partialTimeoutRef.current) {
        clearTimeout(partialTimeoutRef.current);
      }
    };
  }, []);

  // Font size classes
  const labelSize = isLargeFont ? 'text-6xl' : 'text-4xl';
  const readingSize = isLargeFont ? 'text-2xl' : 'text-xl';
  const statusSize = isLargeFont ? 'text-2xl' : 'text-xl';

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
                <p className={`text-white ${labelSize} font-bold tracking-[0.2em]`}>
                  {result.resultA.label}: {result.resultA.date} - {result.resultA.zodiac} ({result.resultA.vedic})
                </p>
                <div className={`text-white ${readingSize} font-light leading-relaxed`}>
                  <p>• PER: {result.resultA.reading.per}</p>
                  <p>• PST: {result.resultA.reading.pst}</p>
                  <p>• PRE: {result.resultA.reading.pre}</p>
                  <p>• FTR: {result.resultA.reading.ftr}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className={`text-white ${labelSize} font-bold tracking-[0.2em]`}>
                  {result.resultB.label}: {result.resultB.date} - {result.resultB.zodiac} ({result.resultB.vedic})
                </p>
                <div className={`text-white ${readingSize} font-light leading-relaxed`}>
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
                <p className={`text-[#333333] ${statusSize} font-light tracking-wider uppercase`}>
                  Heard: {Object.values(result.partialMatch).filter(Boolean).join(', ')}
                </p>
              )}
              <p className={`text-[#444444] ${statusSize} font-light tracking-wider`}>
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
