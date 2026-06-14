import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { createManagedMemberSchema } from '@the-prophet/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function AddManagedMemberModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const displayName = String(new FormData(e.currentTarget).get('displayName') ?? '').trim();
    const parsed = createManagedMemberSchema.safeParse({ displayName });
    if (!parsed.success) {
      setError('El nombre debe tener entre 1 y 40 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/users/managed', parsed.data);
      onClose();
    } catch {
      setError('No se pudo agregar el miembro. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar perfil familiar</DialogTitle>
          <DialogDescription>
            Crea un perfil para un menor que no tiene cuenta propia. Tú administrarás sus predicciones.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="managed-name" className="text-sm font-bold text-(--color-on-surface)">
              Nombre *
            </label>
            <Input id="managed-name" name="displayName" placeholder="Mateo García" maxLength={40} required />
            {error && <p className="text-xs text-(--color-score-red)">{error}</p>}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [showAddMember, setShowAddMember] = useState(false);

  function handleLogout() {
    fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
      .finally(() => logout());
  }

  if (!user) return null;

  const isAdmin = user.isSuperAdmin || !user.managedBy;

  return (
    <div className="mt-6 pb-6">
      {/* Profile header */}
      <div className="bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-(--color-outline-variant)/30 flex flex-col items-center text-center gap-4 mb-6">
        <Avatar className="w-24 h-24 border-4 border-(--color-stadium-green-light)">
          <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName} />
          <AvatarFallback className="text-2xl">{initials(user.displayName)}</AvatarFallback>
        </Avatar>

        <div>
          <h2 className="text-2xl font-bold text-(--color-on-surface)">{user.displayName}</h2>
          {user.email && (
            <p className="text-sm text-(--color-on-surface-variant)">{user.email}</p>
          )}
          {user.provider === 'guest' && (
            <span className="mt-1 inline-block text-xs font-bold bg-(--color-surface-container) text-(--color-on-surface-variant) px-3 py-1 rounded-full">
              Invitado
            </span>
          )}
        </div>

        <Button variant="outline" className="w-full max-w-xs" onClick={() => {}}>
          Editar perfil
        </Button>
      </div>

      {/* Managed profiles section (admin only) */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-(--color-outline-variant)/30 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-(--color-surface-container-low) flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-(--color-on-surface)">Perfiles familiares</h3>
              <p className="text-xs text-(--color-on-surface-variant)">Niños sin cuenta propia</p>
            </div>
            <button
              onClick={() => setShowAddMember(true)}
              className="w-10 h-10 bg-(--color-stadium-green-light) text-white rounded-xl flex items-center justify-center hover:bg-(--color-stadium-green-dark) transition-all active:scale-95"
              aria-label="Agregar perfil"
            >
              <MaterialIcon icon="add" />
            </button>
          </div>
          <div className="p-6 text-center text-(--color-on-surface-variant)">
            <MaterialIcon icon="child_care" className="text-4xl mb-2" />
            <p className="text-sm">Aún no hay perfiles familiares.</p>
            <button
              onClick={() => setShowAddMember(true)}
              className="mt-3 text-sm font-bold text-(--color-stadium-green-light) hover:underline"
            >
              Agregar ahora
            </button>
          </div>
        </div>
      )}

      {/* Settings list */}
      <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-(--color-outline-variant)/30 overflow-hidden">
        {[
          { icon: 'notifications', label: 'Notificaciones' },
          { icon: 'privacy_tip', label: 'Privacidad' },
          { icon: 'help', label: 'Ayuda' },
        ].map(({ icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-(--color-surface-container-low) transition-colors border-b border-(--color-surface-container-low) last:border-0 text-left"
          >
            <MaterialIcon icon={icon} className="text-(--color-on-surface-variant)" />
            <span className="flex-1 text-base text-(--color-on-surface)">{label}</span>
            <MaterialIcon icon="chevron_right" className="text-(--color-outline)" />
          </button>
        ))}
      </div>

      {/* Logout */}
      <Button variant="ghost" className="w-full mt-6 text-(--color-score-red)" onClick={handleLogout}>
        <MaterialIcon icon="logout" className="mr-2" />
        Cerrar sesión
      </Button>

      <AddManagedMemberModal open={showAddMember} onClose={() => setShowAddMember(false)} />
    </div>
  );
}
