import { useState, useCallback } from 'react';

export interface AIRequestState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseAIRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retries?: number;
}

export function useAIRequest<T>(endpoint: string, options?: UseAIRequestOptions<T>) {
  const [state, setState] = useState<AIRequestState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (payload: any, customOptions?: { retries?: number }) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      
      const maxRetries = customOptions?.retries ?? options?.retries ?? 0;
      let attempt = 0;
      let lastError: Error | null = null;

      while (attempt <= maxRetries) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Request failed with status ${response.status}`);
          }

          const result = await response.json();
          setState({ data: result, isLoading: false, error: null });
          
          if (options?.onSuccess) {
            options.onSuccess(result);
          }
          return result;
        } catch (err: any) {
          lastError = err;
          attempt++;
          // Exponential backoff for retries
          if (attempt <= maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }
        }
      }

      const errorMsg = lastError?.message || 'An unexpected error occurred';
      setState({ data: null, isLoading: false, error: errorMsg });
      
      if (options?.onError && lastError) {
        options.onError(lastError);
      }
      
      throw lastError;
    },
    [endpoint, options]
  );

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, isLoading: false, error: null }),
  };
}
