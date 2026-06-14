import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Re-fetch on window focus only in production
      refetchOnWindowFocus: import.meta.env.PROD,
      // 5 minutes stale time — good balance for match data
      staleTime: 5 * 60 * 1000,
      // 10 minutes gc time
      gcTime: 10 * 60 * 1000,
      // Don't retry on 4xx errors (user/auth problems)
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
