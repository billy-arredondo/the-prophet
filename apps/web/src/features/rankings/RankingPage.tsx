import { useState } from 'react';
import type { RankingEntry } from '@the-prophet/shared';
import { useRanking } from '@/hooks/useRanking';
import { useUiStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { InviteModal } from '@/features/groups/InviteModal';
import { cn } from '@/lib/utils';

// ---- Mock data ----
const MOCK_RANKING: RankingEntry[] = [
  { id: 'r1', groupId: '1', userId: 'u1', displayName: 'Juan García',  photoURL: null, totalPoints: 124, predictionsCount: 15, lastUpdated: new Date().toISOString() },
  { id: 'r2', groupId: '1', userId: 'u2', displayName: 'Elena M.',     photoURL: null, totalPoints: 112, predictionsCount: 14, lastUpdated: new Date().toISOString() },
  { id: 'r3', groupId: '1', userId: 'u3', displayName: 'Carlos R.',    photoURL: null, totalPoints: 98,  predictionsCount: 13, lastUpdated: new Date().toISOString() },
  { id: 'r4', groupId: '1', userId: 'me', displayName: 'Tú (Diego)',   photoURL: null, totalPoints: 92,  predictionsCount: 12, lastUpdated: new Date().toISOString() },
  { id: 'r5', groupId: '1', userId: 'u5', displayName: 'Sofia L.',     photoURL: null, totalPoints: 87,  predictionsCount: 11, lastUpdated: new Date().toISOString() },
  { id: 'r6', groupId: '1', userId: 'u6', displayName: 'Marco P.',     photoURL: null, totalPoints: 79,  predictionsCount: 10, lastUpdated: new Date().toISOString() },
];

const MOCK_GROUP = {
  id: '1',
  name: 'Los García',
  memberCount: 12,
  inviteCode: 'GARCIA26',
};

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

  const activeGroupId = useUiStore((s) => s.activeGroupId) ?? '1';
  const currentUserId = useAuthStore((s) => s.user?.id);

  const { data, isLoading, isError } = useRanking(activeGroupId);
  const entries = (isError || !data) ? MOCK_RANKING : data;

  // Displayed entries: top 5 + current user if outside top 5
  const top5 = entries.slice(0, 5);
  const meEntry = entries.find((e) => e.userId === (currentUserId ?? 'me'));
  const meRank = entries.findIndex((e) => e.userId === (currentUserId ?? 'me')) + 1;
  const showMeSeparately = meRank > 5 && meEntry;

  function handleCopyCode() {
    navigator.clipboard.writeText(MOCK_GROUP.inviteCode).then(() => {
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
              <h2 className="text-2xl font-bold text-(--color-on-surface)">{MOCK_GROUP.name}</h2>
              <div className="flex items-center gap-2 mt-1 text-(--color-on-surface-variant)">
                <MaterialIcon icon="groups" size={18} />
                <span className="text-base">{MOCK_GROUP.memberCount} participantes</span>
              </div>
            </div>

            {/* Invite code */}
            <div className="bg-(--color-surface-container-low) rounded-lg p-3 border border-(--color-outline-variant)/30 flex flex-col gap-1 min-w-[160px]">
              <span className="text-[10px] font-bold text-(--color-on-surface-variant) uppercase tracking-wider">
                INVITE CODE
              </span>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg tracking-widest text-(--color-primary)">
                  {MOCK_GROUP.inviteCode}
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
        ) : (
          <div className="divide-y divide-(--color-surface-container-low)">
            {top5.map((entry, i) => (
              <RankRow
                key={entry.id}
                entry={entry}
                rank={i + 1}
                isMe={entry.userId === (currentUserId ?? 'me')}
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
        groupName={MOCK_GROUP.name}
        inviteCode={MOCK_GROUP.inviteCode}
      />
    </div>
  );
}
