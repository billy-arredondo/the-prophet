import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface Props {
  children: React.ReactNode;
}

/**
 * Guards routes that require a logged-in (or guest) session.
 * While session is being restored, shows a loading spinner.
 */
export function RequireAuth({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--color-surface)">
        <span className="material-symbols-outlined text-(--color-stadium-green-light) animate-spin text-5xl">
          sports_soccer
        </span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
