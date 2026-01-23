import { useState, useCallback, useRef, useEffect } from 'react';
import { useWakeLock } from '@/hooks/useWakeLock';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { ParseResult } from '@/lib/keywordParser';
import { LockedSlots } from '@/lib/streamingKeywordParser';

const Index = () => {
  const [result, setResult] = useState<ParseResult | null>(null);
  const [isActivated, setIsActivated] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [partialSlots, setPartialSlots] = useState<LockedSlots | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const partialTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number>(0);
  const { vibrateReady, vibrateMatch, vibrateError } = useHapticFeedback();

  // Keep screen awake
  useWakeLock();

  // Clear partial timeout
  const clearPartialTimeout = useCallback(() => {
    if (partialTimeoutRef.current) {
      clearTimeout(partialTimeoutRef.current);
      partialTimeoutRef.current = null;
    }
  }, []);

  // Handle match - INSTANT callback from speech recognition
  const handleMatch = useCallback((parsed: ParseResult) => {
    if (parsed.success) {
      // INSTANT haptic feedback - exact millisecond of 3rd word detection
      vibrateMatch();
      setResult(parsed);
      setPartialSlots(null);
      clearPartialTimeout();
    }
  }, [vibrateMatch, clearPartialTimeout]);

  // Handle partial slot updates
  const handlePartialUpdate = useCallback((slots: LockedSlots) => {
    const hasAny = slots.trimester || slots.red || slots.economic;
    const hasAll = slots.trimester && slots.red && slots.economic;
    
    if (hasAny && !hasAll && !result?.success) {
      setPartialSlots(slots);
      
      // Start 15-second timeout to clear partial slots
      clearPartialTimeout();
      partialTimeoutRef.current = setTimeout(() => {
        setPartialSlots(null);
      }, 15000);
    }
  }, [result?.success, clearPartialTimeout]);

  const { isListening, isSupported, startListening, stopListening, clearSlots } = useSpeechRecognition({
    onMatch: handleMatch,
    onPartialUpdate: handlePartialUpdate,
  });

  // Handle double-tap for font size toggle
  const handleDoubleTap = useCallback(() => {
    setIsLargeFont(prev => !prev);
  }, []);

  // Handle long-press for hard reset
  const handleHardReset = useCallback(() => {
    vibrateReady();
    stopListening();
    setResult(null);
    setPartialSlots(null);
    setIsActivated(false);
    clearSlots();
    clearPartialTimeout();
  }, [vibrateReady, stopListening, clearSlots, clearPartialTimeout]);

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
      setPartialSlots(null);
      clearSlots();
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
  }, [isActivated, result, vibrateReady, startListening, handleDoubleTap, handleHardReset, clearSlots]);

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
      setPartialSlots(null);
      clearSlots();
    }
  }, [isActivated, result, clearSlots]);

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

      {/* Show locked slots while detecting (partial match) */}
      {partialSlots && !result?.success && (
        <div className="absolute top-8 text-[#333333] text-lg font-light tracking-wider">
          {partialSlots.trimester && <span className="mr-4">✓ {partialSlots.trimester}</span>}
          {partialSlots.red && <span className="mr-4">✓ {partialSlots.red}</span>}
          {partialSlots.economic && <span>✓ {partialSlots.economic}</span>}
        </div>
      )}

      {result?.success && result.resultA && result.resultB && (
        <div className="text-left px-8">
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
        </div>
      )}
    </div>
  );
};

export default Index;
