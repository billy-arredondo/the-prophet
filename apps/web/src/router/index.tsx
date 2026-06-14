import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { RequireAuth } from './RequireAuth';

// Lazy-load routes — bundle-dynamic-imports pattern
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const GroupsPage = lazy(() => import('@/features/groups/GroupsPage'));
const MatchesPage = lazy(() => import('@/features/matches/MatchesPage'));
const RankingPage = lazy(() => import('@/features/rankings/RankingPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <span className="material-symbols-outlined text-stadium-green-light animate-spin text-4xl">
        sports_soccer
      </span>
    </div>
  );
}

function SuspenseRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SuspenseRoute>
        <LoginPage />
      </SuspenseRoute>
    ),
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/groups" replace /> },
      {
        path: 'groups',
        element: (
          <SuspenseRoute>
            <GroupsPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'matches',
        element: (
          <SuspenseRoute>
            <MatchesPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'rankings',
        element: (
          <SuspenseRoute>
            <RankingPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <SuspenseRoute>
            <ProfilePage />
          </SuspenseRoute>
        ),
      },
    ],
  },
  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
