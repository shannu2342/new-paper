import { useEffect, useRef } from 'react';

const DEFAULT_INTERVAL = 15000;

export const useLiveRefresh = (callback, deps = [], intervalMs = DEFAULT_INTERVAL) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    let timerId = null;

    const run = () => {
      callbackRef.current?.();
    };

    timerId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        run();
      }
    }, intervalMs);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        run();
      }
    };

    window.addEventListener('focus', run);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (timerId) clearInterval(timerId);
      window.removeEventListener('focus', run);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [intervalMs, ...deps]);
};
