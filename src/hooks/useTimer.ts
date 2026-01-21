import { useState, useRef, useCallback, useEffect } from 'react';

interface UseTimerOptions {
  initialTime: number;
  onComplete?: () => void;
  autoStart?: boolean;
  interval?: number;
}

interface UseTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
  restart: (newTime?: number) => void;
}

export function useTimer({
  initialTime,
  onComplete,
  autoStart = false,
  interval = 100,
}: UseTimerOptions): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const remainingTimeRef = useRef(initialTime);
  const onCompleteRef = useRef(onComplete);

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    if (remainingTimeRef.current <= 0) return;

    startTimeRef.current = Date.now();
    setIsRunning(true);

    clearTimer();
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      const newTimeLeft = Math.max(0, remainingTimeRef.current - elapsed);

      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearTimer();
        setIsRunning(false);
        remainingTimeRef.current = 0;
        onCompleteRef.current?.();
      }
    }, interval);
  }, [clearTimer, interval]);

  const pause = useCallback(() => {
    if (!isRunning) return;

    clearTimer();
    const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
    setTimeLeft(remainingTimeRef.current);
    setIsRunning(false);
  }, [clearTimer, isRunning]);

  const reset = useCallback((newTime?: number) => {
    clearTimer();
    const time = newTime ?? initialTime;
    remainingTimeRef.current = time;
    setTimeLeft(time);
    setIsRunning(false);
  }, [clearTimer, initialTime]);

  const restart = useCallback((newTime?: number) => {
    const time = newTime ?? initialTime;
    remainingTimeRef.current = time;
    setTimeLeft(time);
    startTimeRef.current = Date.now();
    setIsRunning(true);

    clearTimer();
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      const newTimeLeft = Math.max(0, remainingTimeRef.current - elapsed);

      setTimeLeft(newTimeLeft);

      if (newTimeLeft <= 0) {
        clearTimer();
        setIsRunning(false);
        remainingTimeRef.current = 0;
        onCompleteRef.current?.();
      }
    }, interval);
  }, [clearTimer, initialTime, interval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
    restart,
  };
}
