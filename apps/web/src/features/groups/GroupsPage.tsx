import { useState } from 'react';
import type { Group } from '@the-prophet/shared';
import { useGroups } from '@/hooks/useGroups';
import { useUiStore } from '@/stores/uiStore';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { CreateGroupModal } from './CreateGroupModal';
import { JoinGroupModal } from './JoinGroupModal';

// ---- Mock data (clearly isolated, swappable with real API data) ----
const MOCK_GROUPS: Group[] = [
  {
    id: '1',
    name: 'Los García',
    description: 'La familia completa',
    tournamentId: 'wc2026',
    createdBy: 'user1',
    adminIds: ['user1'],
    memberIds: Array.from({ length: 12 }, (_, i) => `u${i}`),
    inviteCode: 'GARCIA26',
    visibility: 'private',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Oficina Mundialista',
    description: 'El equipo de trabajo',
    tournamentId: 'wc2026',
    createdBy: 'user2',
    adminIds: ['user2'],
    memberIds: Array.from({ length: 45 }, (_, i) => `u${i}`),
    inviteCode: 'OFICINA6',
    visibility: 'private',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Los Pibes de Siempre',
    description: 'Los amigos del barrio',
    tournamentId: 'wc2026',
    createdBy: 'user3',
    adminIds: ['user3'],
    memberIds: Array.from({ length: 10 }, (_, i) => `u${i}`),
    inviteCode: 'PIBES226',
    visibility: 'private',
    createdAt: new Date().toISOString(),
  },
];

function GroupCard({ group }: { group: Group }) {
  const setActiveGroup = useUiStore((s) => s.setActiveGroupId);
  const memberCount = group.memberIds.length;

  return (
    <div
      className="bento-card bg-white rounded-xl p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-(--color-outline-variant)/30 flex flex-col gap-3 relative overflow-hidden cursor-pointer"
      onClick={() => setActiveGroup(group.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && setActiveGroup(group.id)}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        {/* Group avatar placeholder */}
        <div className="w-16 h-16 rounded-full bg-(--color-primary-container) flex items-center justify-center shrink-0">
          <MaterialIcon icon="groups" filled className="text-(--color-on-primary-container) text-3xl" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold text-(--color-on-surface) truncate">{group.name}</h3>
          <div className="flex items-center gap-1 mt-1">
            <MaterialIcon icon="leaderboard" filled className="text-(--color-trophy-gold-muted) text-[18px]" />
            <span className="text-sm font-bold text-(--color-on-surface-variant)">
              {memberCount} participantes
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-(--color-surface-container-low)">
        {/* Avatar stack */}
        <AvatarStack count={memberCount} />

        <button
          className="bg-(--color-stadium-green-light)/10 text-(--color-stadium-green-light) font-bold text-sm px-4 py-2 rounded-lg hover:bg-(--color-stadium-green-light) hover:text-white transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setActiveGroup(group.id);
          }}
        >
          Ver Grupo
        </button>
      </div>
    </div>
  );
}

function AvatarStack({ count }: { count: number }) {
  const shown = Math.min(3, count);
  const rest = count - shown;
  const colors = ['bg-(--color-stadium-green-light)', 'bg-(--color-action-blue)', 'bg-(--color-secondary-container)'];

  return (
    <div className="flex -space-x-2">
      {Array.from({ length: shown }).map((_, i) => (
        <div
          key={i}
          className={`w-8 h-8 rounded-full border-2 border-white ${colors[i] ?? 'bg-(--color-surface-container)'} flex items-center justify-center`}
        >
          <MaterialIcon icon="person" className="text-white text-sm" />
        </div>
      ))}
      {rest > 0 && (
        <div className="w-8 h-8 rounded-full border-2 border-white bg-(--color-surface-container-highest) flex items-center justify-center text-[10px] font-bold text-(--color-on-surface-variant)">
          +{rest}
        </div>
      )}
    </div>
  );
}

function GroupsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4">
      {[1, 2].map((i) => (
        <div key={i} className="h-32 bg-(--color-surface-container) rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({
  onJoin,
  onCreate,
}: {
  onJoin: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="mt-6 p-8 rounded-xl border-2 border-dashed border-(--color-outline-variant) flex flex-col items-center justify-center text-center bg-white/50">
      <MaterialIcon icon="group_add" className="text-[48px] text-(--color-outline) mb-4" />
      <h4 className="text-xl font-semibold text-(--color-on-surface-variant)">¿Falta alguien?</h4>
      <p className="text-base text-(--color-outline) mt-2 mb-6 max-w-xs">
        Crea un grupo nuevo o únete con un código de invitación.
      </p>
      <div className="flex gap-4 w-full max-w-sm">
        <button
          onClick={onJoin}
          className="flex-1 h-12 bg-white border-2 border-(--color-stadium-green-light) text-(--color-stadium-green-light) rounded-xl font-bold hover:bg-(--color-surface-container-low) transition-all"
        >
          Unirse
        </button>
        <button
          onClick={onCreate}
          className="flex-1 h-12 bg-(--color-stadium-green-light) text-white rounded-xl font-bold shadow-lg hover:bg-(--color-stadium-green-dark) transition-all"
        >
          Crear Grupo
        </button>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  // Try real API; fall back to mock while backend is offline
  const { data, isLoading, isError } = useGroups();
  const groups = (isError || !data) ? MOCK_GROUPS : data;

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-xs font-bold text-(--color-stadium-green-light) uppercase tracking-wider mb-1">
            Campeonato 2026
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-(--color-on-surface)">Mis Grupos</h2>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="h-12 w-12 bg-(--color-stadium-green-light) text-white rounded-xl shadow-lg flex items-center justify-center hover:bg-(--color-stadium-green-dark) transition-all active:scale-95"
          aria-label="Crear grupo"
        >
          <MaterialIcon icon="add" />
        </button>
      </div>

      {/* Group list */}
      {isLoading ? (
        <GroupsSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {groups.map((g) => (
            <GroupCard key={g.id} group={g} />
          ))}
        </div>
      )}

      {/* Empty / Join+Create CTA */}
      <EmptyState onJoin={() => setShowJoin(true)} onCreate={() => setShowCreate(true)} />

      {/* Modals */}
      <CreateGroupModal open={showCreate} onClose={() => setShowCreate(false)} />
      <JoinGroupModal open={showJoin} onClose={() => setShowJoin(false)} />
    </div>
  );
}
