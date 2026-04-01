import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * useAutoRefresh
 *
 * Automatically refetches the specified React Query keys every `interval` ms,
 * but ONLY when the browser tab is visible and the device is online.
 * Invalidation is paused when the user switches tabs or goes offline,
 * and fires immediately on resume / reconnect.
 */
export const useAutoRefresh = (
  queryKeys: string[][],
  interval = 30_000, // 30 s default
) => {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isOnlineRef = useRef(navigator.onLine);
  const isVisibleRef = useRef(document.visibilityState === 'visible');

  const invalidate = useCallback(() => {
    if (!isOnlineRef.current || !isVisibleRef.current) return;
    queryKeys.forEach((key) =>
      queryClient.invalidateQueries({ queryKey: key }),
    );
  }, [queryClient, queryKeys]);

  // Start / restart the interval
  const start = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(invalidate, interval);
  }, [invalidate, interval]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    start();

    const handleVisibilityChange = () => {
      isVisibleRef.current = document.visibilityState === 'visible';
      if (isVisibleRef.current) {
        invalidate(); // immediate refresh on tab focus
        start();
      } else {
        stop();
      }
    };

    const handleOnline = () => {
      isOnlineRef.current = true;
      invalidate(); // immediate refresh on reconnect
      start();
    };

    const handleOffline = () => {
      isOnlineRef.current = false;
      stop();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [invalidate, start, stop]);
};
