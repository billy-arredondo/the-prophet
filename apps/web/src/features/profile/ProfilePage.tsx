import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { useAuthStore } from '@/stores/authStore';
import { useUiStore } from '@/stores/uiStore';
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
import { authClient } from '@/lib/authClient';
import { createManagedMemberSchema } from '@the-prophet/shared';
import { useManagedMembers, useCreateManagedMember, useManagedMemberAccessLink } from '@/hooks/useManagedMembers';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// ─── AddManagedMemberModal ────────────────────────────────────────────────────

interface AccessLinkState {
  url: string;
  token: string;
}

function AddManagedMemberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [error, setError] = useState('');
  const [accessLink, setAccessLink] = useState<AccessLinkState | null>(null);
  const [copied, setCopied] = useState(false);

  const createMember = useCreateManagedMember();
  const getAccessLink = useManagedMemberAccessLink();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const displayName = String(new FormData(e.currentTarget).get('displayName') ?? '').trim();
    const parsed = createManagedMemberSchema.safeParse({ displayName });
    if (!parsed.success) {
      setError('El nombre debe tener entre 1 y 40 caracteres.');
      return;
    }
    try {
      const member = await createMember.mutateAsync(parsed.data);
      const link = await getAccessLink.mutateAsync(member.id);
      setAccessLink(link);
    } catch {
      setError('No se pudo agregar el miembro. Intenta de nuevo.');
    }
  }

  function handleCopy() {
    if (!accessLink) return;
    navigator.clipboard.writeText(accessLink.url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleClose() {
    setAccessLink(null);
    setError('');
    setCopied(false);
    onClose();
  }

  const isLoading = createMember.isPending || getAccessLink.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar perfil familiar</DialogTitle>
          <DialogDescription>
            Crea un perfil para un menor que no tiene cuenta propia. Tú administrarás sus
            predicciones.
          </DialogDescription>
        </DialogHeader>

        {accessLink ? (
          /* ── Step 2: show link + QR ── */
          <div className="flex flex-col items-center gap-6 mt-2">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-(--color-surface-container)">
              <QRCodeSVG value={accessLink.url} size={180} level="M" />
            </div>

            <div className="w-full bg-(--color-surface-container-low) rounded-xl p-4 border border-(--color-outline-variant)/30">
              <p className="text-xs font-bold text-(--color-on-surface-variant) mb-2 uppercase tracking-wider">
                Enlace de acceso
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-(--color-on-surface) truncate break-all">
                  {accessLink.url}
                </span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-2 rounded-lg hover:bg-(--color-surface-container) transition-colors text-(--color-stadium-green-light)"
                  aria-label="Copiar enlace"
                >
                  <MaterialIcon icon={copied ? 'check' : 'content_copy'} />
                </button>
              </div>
            </div>

            <button
              onClick={handleCopy}
              className="w-full h-12 bg-(--color-stadium-green-light) text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-(--color-stadium-green-dark) transition-all"
            >
              <MaterialIcon icon={copied ? 'check' : 'share'} />
              {copied ? '¡Copiado!' : 'Copiar enlace'}
            </button>

            <Button variant="outline" className="w-full" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        ) : (
          /* ── Step 1: enter name ── */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="managed-name"
                className="text-sm font-bold text-(--color-on-surface)"
              >
                Nombre *
              </label>
              <Input
                id="managed-name"
                name="displayName"
                placeholder="Mateo García"
                maxLength={40}
                required
              />
              {error && <p className="text-xs text-(--color-score-red)">{error}</p>}
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? 'Agregando...' : 'Agregar'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── EditProfileModal ─────────────────────────────────────────────────────────

function EditProfileModal({
  open,
  onClose,
  currentDisplayName,
}: {
  open: boolean;
  onClose: () => void;
  currentDisplayName: string;
}) {
  const [error, setError] = useState('');
  const updateProfile = useUpdateProfile();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const displayName = String(new FormData(e.currentTarget).get('displayName') ?? '').trim();
    if (!displayName) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    try {
      await updateProfile.mutateAsync({ displayName });
      onClose();
    } catch {
      setError('No se pudo actualizar el perfil. Intenta de nuevo.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar perfil</DialogTitle>
          <DialogDescription>Actualiza tu nombre visible en la app.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="edit-display-name"
              className="text-sm font-bold text-(--color-on-surface)"
            >
              Nombre *
            </label>
            <Input
              id="edit-display-name"
              name="displayName"
              defaultValue={currentDisplayName}
              maxLength={40}
              required
            />
            {error && <p className="text-xs text-(--color-score-red)">{error}</p>}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── ProfilePage ──────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUiStore();
  const navigate = useNavigate();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const { data: managedMembers = [], isLoading: membersLoading } = useManagedMembers();

  async function handleLogout() {
    try {
      await authClient.signOut();
    } finally {
      logout();
    }
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

        <Button variant="outline" className="w-full max-w-xs" onClick={() => setShowEditProfile(true)}>
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

          {membersLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-14 bg-(--color-surface-container) rounded-lg animate-pulse" />
              ))}
            </div>
          ) : managedMembers.length === 0 ? (
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
          ) : (
            <ul className="divide-y divide-(--color-surface-container-low)">
              {managedMembers.map((member) => (
                <li key={member.id} className="flex items-center gap-4 px-6 py-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={member.photoURL ?? undefined} alt={member.displayName} />
                    <AvatarFallback className="text-sm font-bold">
                      {initials(member.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex-1 text-base text-(--color-on-surface)">{member.displayName}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Super-admin panel link */}
      {user.isSuperAdmin && (
        <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-(--color-outline-variant)/30 overflow-hidden mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-(--color-surface-container-low) transition-colors text-left"
          >
            <MaterialIcon icon="admin_panel_settings" className="text-(--color-stadium-green-light)" />
            <div className="flex-1">
              <p className="text-base font-semibold text-(--color-on-surface)">Panel de administrador</p>
              <p className="text-xs text-(--color-on-surface-variant)">Confirma resultados oficiales</p>
            </div>
            <MaterialIcon icon="chevron_right" className="text-(--color-outline)" />
          </button>
        </div>
      )}

      {/* Settings list */}
      <div className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-(--color-outline-variant)/30 overflow-hidden">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-4 px-6 py-4 hover:bg-(--color-surface-container-low) transition-colors border-b border-(--color-surface-container-low) text-left"
        >
          <MaterialIcon
            icon={theme === 'dark' ? 'light_mode' : 'dark_mode'}
            className="text-(--color-on-surface-variant)"
          />
          <span className="flex-1 text-base text-(--color-on-surface)">Apariencia</span>
          <span className="text-sm font-medium text-(--color-on-surface-variant)">
            {theme === 'dark' ? 'Oscuro' : 'Claro'}
          </span>
        </button>

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
      <Button
        variant="ghost"
        className="w-full mt-6 text-(--color-score-red)"
        onClick={handleLogout}
      >
        <MaterialIcon icon="logout" className="mr-2" />
        Cerrar sesión
      </Button>

      <AddManagedMemberModal open={showAddMember} onClose={() => setShowAddMember(false)} />
      <EditProfileModal
        open={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentDisplayName={user.displayName}
      />
    </div>
  );
}
