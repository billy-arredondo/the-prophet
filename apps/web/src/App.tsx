import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { useAuthStore } from './stores/authStore';
import { api } from './lib/api';
import type { User } from '@the-prophet/shared';

/**
 * Restore session on mount by hitting /api/auth/me.
 * This is the only place we hydrate authStore from the server — advanced-init-once pattern.
 */
function SessionRestorer() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<User>('/api/auth/me', controller.signal)
      .then((user) => setUser(user))
      .catch(() => setUser(null));

    return () => controller.abort();
  }, [setUser, setLoading]);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionRestorer />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
