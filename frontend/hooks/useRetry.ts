/**
 * useRetry Hook
 * Provides retry mechanism for failed API calls with exponential backoff
 */

import { useCallback, useState } from "react";

interface UseRetryOptions {
  /** Maximum number of retry attempts */
  maxRetries?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Backoff multiplier */
  backoffMultiplier?: number;
}

interface RetryState {
  retryCount: number;
  isRetrying: boolean;
  lastError: Error | null;
}

export function useRetry(options: UseRetryOptions = {}) {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000, backoffMultiplier = 2 } = options;

  const [state, setState] = useState<RetryState>({
    retryCount: 0,
    isRetrying: false,
    lastError: null,
  });

  const retry = useCallback(
    async <T>(fn: () => Promise<T>): Promise<T> => {
      let attempt = 0;
      let delay = initialDelay;

      while (attempt <= maxRetries) {
        try {
          if (attempt > 0) {
            setState((prev) => ({ ...prev, isRetrying: true }));
            await new Promise((resolve) => setTimeout(resolve, delay));
          }

          const result = await fn();
          setState({ retryCount: 0, isRetrying: false, lastError: null });
          return result;
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          setState({
            retryCount: attempt,
            isRetrying: false,
            lastError: err,
          });

          if (attempt >= maxRetries) {
            throw err;
          }

          attempt++;
          delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
      }

      throw new Error("Retry failed");
    },
    [maxRetries, initialDelay, maxDelay, backoffMultiplier]
  );

  const reset = useCallback(() => {
    setState({ retryCount: 0, isRetrying: false, lastError: null });
  }, []);

  return {
    retry,
    reset,
    retryCount: state.retryCount,
    isRetrying: state.isRetrying,
    lastError: state.lastError,
    canRetry: state.retryCount < maxRetries,
  };
}
