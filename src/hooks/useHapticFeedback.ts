export const useHapticFeedback = () => {
  const vibrate = (pattern: number | number[] = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const vibrateReady = () => vibrate(30);
  const vibrateMatch = () => vibrate([50, 30, 50]);
  const vibrateError = () => vibrate(100);

  return { vibrate, vibrateReady, vibrateMatch, vibrateError };
};
