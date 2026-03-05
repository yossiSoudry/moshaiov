'use client';

import { useEffect } from 'react';
import { getErrorMessage } from '@/lib/utils';

export function GlobalErrorHandler({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Handler for unhandled promise rejections
    function handleUnhandledRejection(event: PromiseRejectionEvent) {
      const errorMessage = getErrorMessage(event.reason);

      // Log detailed error info
      console.error('[Unhandled Promise Rejection]', {
        message: errorMessage,
        reason: event.reason,
        type: typeof event.reason,
        isXHR: event.reason instanceof XMLHttpRequest,
        // If it's an XMLHttpRequest, try to get more info
        ...(event.reason && typeof event.reason === 'object' && 'status' in event.reason
          ? {
              status: (event.reason as XMLHttpRequest).status,
              statusText: (event.reason as XMLHttpRequest).statusText,
              responseURL: (event.reason as XMLHttpRequest).responseURL,
            }
          : {}),
      });

      // Prevent the default browser behavior (showing error in console)
      event.preventDefault();
    }

    // Handler for general errors
    function handleError(event: ErrorEvent) {
      console.error('[Global Error]', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return <>{children}</>;
}
