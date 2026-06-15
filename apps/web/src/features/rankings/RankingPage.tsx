import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRanking } from '@/hooks/useRanking';
import { useGroup } from '@/hooks/useGroups';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { InviteModal } from '@/features/groups/InviteModal';
import { cn } from '@/lib/utils';
import type { RankingEntry } from '@the-prophet/shared';

function getMedalColor(rank: number) {
  if (rank === 1) return 'text-(--color-secondary-container)'; // gold
  if (rank === 2) return 'text-(--color-outline-variant)';     // silver
  if (rank === 3) return 'text-(--color-secondary-fixed-dim)'; // bronze
  return null;
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function RankRow({
  entry,
  rank,
  isMe,
}: {
  entry: RankingEntry;
  rank: number;
  isMe: boolean;
}) {
  const medalColor = getMedalColor(rank);

  return (
    <div
      className={cn(
        'flex items-center px-6 py-4 hover:bg-(--color-surface-container-low) transition-colors',
        isMe && 'bg-(--color-stadium-green-light)/10 border-l-4 border-(--color-stadium-green-light)',
      )}
    >
      {/* Rank / Medal */}
      <div className="w-10 flex justify-center shrink-0">
        {medalColor ? (
          <MaterialIcon
            icon="workspace_premium"
            filled
            className={cn(medalColor, rank === 1 ? 'text-3xl' : 'text-2xl')}
          />
        ) : (
          <span
            className={cn(
              'text-xl font-bold',
              isMe ? 'text-(--color-stadium-green-light)' : 'text-(--color-outline-variant)',
            )}
          >
            {rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <Avatar
        className={cn(
          'w-12 h-12 ml-2 border-2',
          rank === 1
            ? 'border-(--color-secondary-container)'
            : rank === 2
            ? 'border-(--color-outline-variant)'
            : rank === 3
            ? 'border-(--color-secondary-fixed-dim)'
            : isMe
            ? 'border-(--color-stadium-green-light)'
            : 'border-transparent',
        )}
      >
        <AvatarImage src={entry.photoURL ?? undefined} alt={entry.displayName} />
        <AvatarFallback>{initials(entry.displayName)}</AvatarFallback>
      </Avatar>

      {/* Info */}
      <div className="ml-4 flex-1 min-w-0">
        <p
          className={cn(
            'text-sm font-bold truncate',
            isMe ? 'text-(--color-stadium-green-dark)' : 'text-(--color-on-surface)',
          )}
        >
          {entry.displayName}
        </p>
        <p
          className={cn(
            'text-xs',
            isMe ? 'text-(--color-stadium-green-light)' : 'text-(--color-on-surface-variant)',
          )}
        >
          {entry.predictionsCount} predicciones
        </p>
      </div>

      {/* Points */}
      <div className="text-right">
        <p
          className={cn(
            'text-xl font-black',
            isMe ? 'text-(--color-stadium-green-dark)' : 'text-(--color-on-surface-variant)',
          )}
        >
          {entry.totalPoints}
        </p>
        <p
          className={cn(
            'text-[10px] font-bold uppercase',
            isMe ? 'text-(--color-stadium-green-light)' : 'text-(--color-on-surface-variant)',
          )}
        >
          PTS
        </p>
      </div>
    </div>
  );
}

function RankingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-20 bg-(--color-surface-container) rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

export default function RankingPage() {
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const activeGroupId = useUiStore((s) => s.activeGroupId);
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data: group } = useGroup(activeGroupId ?? '');
  const { data, isLoading, isError } = useRanking(activeGroupId ?? '');
  const entries = data ?? [];

  if (!activeGroupId) {
    return (
      <div className="mt-6 flex flex-col items-center justify-center gap-6 py-16">
        <MaterialIcon icon="groups" className="text-[64px] text-(--color-outline)" />
        <p className="text-xl font-semibold text-(--color-on-surface-variant)">
          Elige un grupo para ver la clasificación
        </p>
        <button
          onClick={() => navigate('/groups')}
          className="h-12 px-8 bg-(--color-stadium-green-light) text-white rounded-xl font-bold shadow-lg hover:bg-(--color-stadium-green-dark) transition-all active:scale-95"
        >
          Ir a Grupos
        </button>
      </div>
    );
  }

  // Displayed entries: top 5 + current user if outside top 5
  const top5 = entries.slice(0, 5);
  const meEntry = entries.find((e) => e.userId === currentUserId);
  const meRank = entries.findIndex((e) => e.userId === currentUserId) + 1;
  const showMeSeparately = meRank > 5 && meEntry != null;

  function handleCopyCode() {
    navigator.clipboard.writeText(group?.inviteCode ?? '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mt-6 pb-6">
      {/* Group Hero Card */}
      <section className="mb-6">
        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden border-b-2 border-(--color-surface-container)">
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-(--color-stadium-green-light) opacity-10 rounded-full blur-2xl" />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-(--color-stadium-green-light) mb-1 block uppercase tracking-wider">
                GRUPO ACTUAL
              </span>
              <h2 className="text-2xl font-bold text-(--color-on-surface)">{group?.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-(--color-on-surface-variant)">
                <MaterialIcon icon="groups" size={18} />
                <span className="text-base">{group?.memberIds.length ?? 0} participantes</span>
              </div>
            </div>

            {/* Invite code */}
            <div className="bg-(--color-surface-container-low) rounded-lg p-3 border border-(--color-outline-variant)/30 flex flex-col gap-1 min-w-[160px]">
              <span className="text-[10px] font-bold text-(--color-on-surface-variant) uppercase tracking-wider">
                INVITE CODE
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg tracking-widest text-(--color-primary)">
                  {group?.inviteCode ?? ''}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="text-(--color-stadium-green-light) active:scale-95 transition-transform"
                  aria-label="Copiar código"
                >
                  <MaterialIcon icon={copied ? 'check' : 'content_copy'} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border-b-2 border-(--color-surface-container) overflow-hidden">
        <div className="px-6 py-4 border-b border-(--color-surface-container-low) flex justify-between items-center">
          <h3 className="text-xl font-semibold text-(--color-on-surface)">Clasificación</h3>
          <MaterialIcon icon="filter_list" className="text-(--color-on-surface-variant)" />
        </div>

        {isLoading ? (
          <div className="p-4">
            <RankingSkeleton />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <MaterialIcon icon="error" className="text-[48px] text-(--color-score-red)" />
            <p className="text-base text-(--color-on-surface-variant)">
              No se pudo cargar la clasificación. Reintenta.
            </p>
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <MaterialIcon icon="leaderboard" className="text-[48px] text-(--color-outline)" />
            <p className="text-base text-(--color-on-surface-variant)">Aún no hay puntajes</p>
          </div>
        ) : (
          <div className="divide-y divide-(--color-surface-container-low)">
            {top5.map((entry, i) => (
              <RankRow
                key={entry.id}
                entry={entry}
                rank={i + 1}
                isMe={entry.userId === currentUserId}
              />
            ))}

            {/* Current user if outside top 5 */}
            {showMeSeparately && (
              <>
                <div className="px-6 py-2 text-center text-xs text-(--color-on-surface-variant)">
                  · · ·
                </div>
                <RankRow entry={meEntry} rank={meRank} isMe />
              </>
            )}
          </div>
        )}

        <button className="w-full py-4 text-center text-sm font-bold text-(--color-stadium-green-light) border-t border-(--color-surface-container-low) hover:bg-(--color-surface-container-low) active:scale-95 transition-colors uppercase tracking-wider">
          Ver Ranking Completo
        </button>
      </section>

      {/* Invite button */}
      <section className="mt-6">
        <button
          onClick={() => setShowInvite(true)}
          className="w-full py-4 bg-(--color-stadium-green-light) text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-[0px_4px_0px_#003300] hover:-translate-y-0.5 hover:shadow-[0px_6px_0px_#003300] transition-all active:scale-95"
        >
          <MaterialIcon icon="person_add" />
          Invitar Amigos
        </button>
        <p className="text-center mt-4 text-base text-(--color-on-surface-variant)">
          Gana +10 pts por cada amigo que se una al grupo.
        </p>
      </section>

      <InviteModal
        open={showInvite}
        onClose={() => setShowInvite(false)}
        groupName={group?.name ?? ''}
        inviteCode={group?.inviteCode ?? ''}
      />
    </div>
  );
}
