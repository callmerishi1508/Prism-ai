import { useState, useCallback, useRef, useEffect } from 'react';

export interface AIRequestState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  latencyMs?: number;
}

export interface UseAIRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retries?: number;
  timeoutMs?: number;
}

export function useAIRequest<T>(endpoint: string, options?: UseAIRequestOptions<T>) {
  const [state, setState] = useState<AIRequestState<T>>({
    data: null,
    isLoading: false,
    error: null,
    latencyMs: undefined,
  });
  
  const activeRequestId = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(
    async (payload: any, customOptions?: { retries?: number }) => {
      const requestId = ++activeRequestId.current;
      
      // Abort any ongoing request before starting a new one
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      const controller = new AbortController();
      abortControllerRef.current = controller;
      
      setState((prev) => ({ ...prev, isLoading: true, error: null, latencyMs: undefined }));
      
      const maxRetries = customOptions?.retries ?? options?.retries ?? 0;
      const timeoutMs = options?.timeoutMs ?? 60000; // Increased to 60s to allow Gemini model fallback
      let attempt = 0;
      let lastError: Error | null = null;
      const startTime = Date.now();

      let finalPayload = { ...payload };
      if (typeof window !== 'undefined') {
        try {
          const storedKey = localStorage.getItem('prism_custom_api_key');
          if (storedKey) {
            finalPayload.customApiKey = storedKey;
          }
        } catch (e) {
          console.warn('localStorage access denied', e);
        }
      }

      while (attempt <= maxRetries) {
        try {
          const timeoutId = setTimeout(() => controller.abort('TimeoutError'), timeoutMs);

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(finalPayload),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `Request failed with status ${response.status}`);
          }

          const result = await response.json();
          if (activeRequestId.current !== requestId || !isMountedRef.current) return result;
          
          const latencyMs = Date.now() - startTime;
          setState({ data: result, isLoading: false, error: null, latencyMs });
          
          if (options?.onSuccess) {
            options.onSuccess(result);
          }
          return result;
        } catch (err: any) {
          if (err.name === 'AbortError' || err === 'TimeoutError') {
            lastError = new Error('Request timed out or was aborted');
            break; // Don't retry on user abort or hard timeout
          }
          
          lastError = err;
          attempt++;
          if (attempt <= maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          }
        }
      }

      if (activeRequestId.current !== requestId || !isMountedRef.current) return;
      
      const errorMsg = lastError?.message || 'An unexpected error occurred';
      setState({ data: null, isLoading: false, error: errorMsg, latencyMs: Date.now() - startTime });
      
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
    reset: () => {
      if (isMountedRef.current) {
        setState({ data: null, isLoading: false, error: null, latencyMs: undefined })
      }
    },
  };
}
