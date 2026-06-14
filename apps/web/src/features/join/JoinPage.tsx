import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
import { useJoinGroup } from '@/hooks/useGroups';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { User } from '@the-prophet/shared';

/**
 * Handles two kinds of links:
 *  - /join?token=<jwt>  → managed-member (minor) device sign-in
 *  - /join?code=<code>  → group invite (join the group, requires a session)
 */
export default function JoinPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();
  const joinGroup = useJoinGroup();
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  const token = params.get('token');
  const code = params.get('code');

  // Device-token redeem (managed minor signs in on this device).
  // Full reload to /groups after the cookie is set so SessionRestorer hydrates
  // from /api/me with the device cookie present (avoids a race with setUser).
  useEffect(() => {
    if (!token || ran.current) return;
    ran.current = true;
    api
      .post<User>('/api/device/session', { token })
      .then(() => {
        window.location.assign('/groups');
      })
      .catch(() =>
        setError('El enlace de acceso no es válido o expiró. Pide uno nuevo al administrador.'),
      );
  }, [token]);

  // Group invite code (needs a session first).
  useEffect(() => {
    if (token || !code || isLoading || ran.current) return;
    ran.current = true;
    if (!isAuthenticated) {
      // Preserve the invite so the user lands back here after logging in.
      navigate(`/login?next=${encodeURIComponent(`/join?code=${code}`)}`, { replace: true });
      return;
    }
    joinGroup
      .mutateAsync({ inviteCode: code })
      .then((group) => {
        useUiStore.getState().setActiveGroupId(group.id);
        navigate('/rankings', { replace: true });
      })
      .catch(() => setError('No se pudo unir al grupo. El código puede ser inválido.'));
  }, [token, code, isAuthenticated, isLoading, navigate, joinGroup]);

  const invalid = !token && !code;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center bg-(--color-surface)">
      {error || invalid ? (
        <>
          <MaterialIcon icon="error" className="text-(--color-score-red) text-5xl" />
          <p className="text-base text-(--color-on-surface)">
            {error ?? 'Enlace inválido.'}
          </p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-sm font-bold text-(--color-stadium-green-dark) underline underline-offset-4"
          >
            Ir al inicio
          </button>
        </>
      ) : (
        <>
          <MaterialIcon
            icon="sports_soccer"
            className="text-(--color-stadium-green-light) animate-spin text-5xl"
          />
          <p className="text-sm text-(--color-on-surface-variant)">Entrando…</p>
        </>
      )}
    </div>
  );
}
