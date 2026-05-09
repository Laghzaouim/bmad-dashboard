import { useEffect } from 'react';

export function useSSE(onDataChanged) {
  useEffect(() => {
    let es;
    let retryTimer;

    function connect() {
      es = new EventSource('/api/events');

      es.addEventListener('data-changed', () => {
        onDataChanged();
      });

      es.onerror = () => {
        es.close();
        retryTimer = setTimeout(connect, 3000);
      };
    }

    connect();

    function handleVisibility() {
      if (document.visibilityState === 'visible') {
        onDataChanged();
      }
    }

    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(retryTimer);
      es?.close();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [onDataChanged]);
}
