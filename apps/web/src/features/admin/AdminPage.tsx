import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import type { Match } from '@the-prophet/shared';
import { useAuthStore } from '@/stores/authStore';
import { usePendingReview, useConfirmResult } from '@/hooks/useAdmin';
import { MaterialIcon } from '@/components/ui/MaterialIcon';

// ─── MatchReviewCard ─────────────────────────────────────────────────────────

function MatchReviewCard({ match }: { match: Match }) {
  const [homeScore, setHomeScore] = useState(match.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState(match.awayScore ?? 0);

  // Sync if the query refreshes with different server values
  useEffect(() => {
    setHomeScore(match.homeScore ?? 0);
    setAwayScore(match.awayScore ?? 0);
  }, [match.homeScore, match.awayScore]);

  const confirm = useConfirmResult();

  function handleConfirm() {
    confirm.mutate({ matchId: match.id, homeScore, awayScore });
  }

  function formatKickoff(iso: string) {
    return new Date(iso).toLocaleString('es-AR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border border-(--color-outline-variant)/30">
      {/* Date */}
      <p className="text-xs text-(--color-on-surface-variant) mb-3">{formatKickoff(match.kickoff)}</p>

      {/* Teams + score inputs */}
      <div className="flex items-center gap-3">
        {/* Home team */}
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-(--color-on-surface) truncate">{match.homeTeam}</p>
        </div>

        {/* Score inputs */}
        <div className="flex items-center gap-2 shrink-0">
          <input
            type="number"
            min={0}
            max={99}
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            disabled={confirm.isPending}
            className="w-14 h-12 text-center text-2xl font-black rounded-xl border border-(--color-outline-variant) bg-(--color-surface-container-lowest) text-(--color-on-surface) focus:outline-none focus:ring-2 focus:ring-(--color-stadium-green-light) disabled:opacity-50"
          />
          <span className="text-lg font-bold text-(--color-outline-variant)">-</span>
          <input
            type="number"
            min={0}
            max={99}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            disabled={confirm.isPending}
            className="w-14 h-12 text-center text-2xl font-black rounded-xl border border-(--color-outline-variant) bg-(--color-surface-container-lowest) text-(--color-on-surface) focus:outline-none focus:ring-2 focus:ring-(--color-stadium-green-light) disabled:opacity-50"
          />
        </div>

        {/* Away team */}
        <div className="flex-1 text-center">
          <p className="text-sm font-bold text-(--color-on-surface) truncate">{match.awayTeam}</p>
        </div>
      </div>

      {/* Confirm button */}
      <button
        onClick={handleConfirm}
        disabled={confirm.isPending}
        className="mt-4 w-full h-11 bg-(--color-stadium-green-light) text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-(--color-stadium-green-dark) transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {confirm.isPending ? (
          <>
            <MaterialIcon icon="hourglass_empty" className="animate-spin text-base" />
            Confirmando...
          </>
        ) : (
          <>
            <MaterialIcon icon="check_circle" className="text-base" />
            Confirmar resultado
          </>
        )}
      </button>

      {/* Error message */}
      {confirm.isError && (
        <p className="mt-2 text-xs text-center text-(--color-score-red)">
          No se pudo confirmar. Intenta de nuevo.
        </p>
      )}
    </div>
  );
}

// ─── AdminPage ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);

  if (!user?.isSuperAdmin) {
    return <Navigate to="/groups" replace />;
  }

  return <AdminContent />;
}

function AdminContent() {
  const { data: matches, isLoading, isError } = usePendingReview();

  return (
    <div className="mt-6 pb-6">
      {/* Hero */}
      <div className="relative h-32 w-full rounded-xl overflow-hidden mb-6 bg-(--color-stadium-green-dark)">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,#4C9141,transparent)]" />
        <div className="absolute inset-0 flex flex-col justify-center px-4 text-white z-10">
          <h2 className="text-2xl font-bold">Panel de administrador</h2>
          <p className="text-base opacity-90">Confirma los resultados oficiales.</p>
        </div>
        <MaterialIcon
          icon="admin_panel_settings"
          className="absolute right-4 bottom-4 text-white/10 text-[80px]"
        />
      </div>

      {/* Content */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <span className="material-symbols-outlined text-stadium-green-light animate-spin text-4xl">
            sports_soccer
          </span>
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-(--color-score-red)">
          <MaterialIcon icon="error_outline" className="text-5xl mb-3" />
          <p className="text-base font-medium">Error al cargar los partidos.</p>
        </div>
      )}

      {!isLoading && !isError && matches?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-(--color-on-surface-variant)">
          <MaterialIcon icon="task_alt" className="text-5xl mb-3" />
          <p className="text-base font-medium">No hay resultados por confirmar.</p>
        </div>
      )}

      {!isLoading && !isError && matches && matches.length > 0 && (
        <div className="space-y-4">
          {matches.map((match) => (
            <MatchReviewCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
