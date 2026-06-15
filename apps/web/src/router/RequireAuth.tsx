import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

interface Props {
  children: React.ReactNode;
}

/**
 * Guards routes that require a logged-in (or guest) session.
 * While session is being restored, shows the branded loading screen.
 */
export function RequireAuth({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen fullscreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
