import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { router } from './router';
import { useAuthStore } from './stores/authStore';
import { useUiStore } from './stores/uiStore';
import { api } from './lib/api';
import type { User } from '@the-prophet/shared';

/**
 * Restore session on mount by hitting /api/me — returns our domain User when a
 * valid Better Auth session cookie is present (401 otherwise). This is the only
 * place we hydrate authStore from the server — advanced-init-once pattern.
 */
function SessionRestorer() {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const controller = new AbortController();
    api
      .get<User>('/api/me', controller.signal)
      .then((user) => setUser(user))
      .catch(() => setUser(null));

    return () => controller.abort();
  }, [setUser]);

  return null;
}

function ThemeApplier() {
  const theme = useUiStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeApplier />
      <SessionRestorer />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
