import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './AppLayout';
import { RequireAuth } from './RequireAuth';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Lazy-load routes — bundle-dynamic-imports pattern
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const JoinPage = lazy(() => import('@/features/join/JoinPage'));
const GroupsPage = lazy(() => import('@/features/groups/GroupsPage'));
const MatchesPage = lazy(() => import('@/features/matches/MatchesPage'));
const RankingPage = lazy(() => import('@/features/rankings/RankingPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));
const AdminPage = lazy(() => import('@/features/admin/AdminPage'));

function SuspenseRoute({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<LoadingScreen />}>{children}</Suspense>;
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
    path: '/join',
    element: (
      <SuspenseRoute>
        <JoinPage />
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
      {
        path: 'admin',
        element: (
          <SuspenseRoute>
            <AdminPage />
          </SuspenseRoute>
        ),
      },
    ],
  },
  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
