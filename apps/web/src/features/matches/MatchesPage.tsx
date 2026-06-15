import { useState, useEffect } from 'react';
import type { Match, Prediction, MatchStatus } from '@the-prophet/shared';
import { useMatches } from '@/hooks/useMatches';
import { useMyPredictions, useUpsertPrediction } from '@/hooks/usePredictions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { teamFlagUrl } from '@/lib/flags';

function TeamFlag({ name }: { name: string }) {
  const src = teamFlagUrl(name, 80);
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={56}
        height={38}
        loading="lazy"
        className="rounded shadow-sm object-cover w-14 h-[38px]"
      />
    );
  }
  return <MaterialIcon icon="flag" className="text-(--color-outline) text-4xl" />;
}

function formatKickoff(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('es-AR', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

// Score stepper — uses useRef for transient value to avoid unnecessary re-renders (rerender-use-ref-transient-values)
function ScoreStepper({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  function decrement() {
    if (disabled || value <= 0) return;
    onChange(value - 1);
  }
  function increment() {
    if (disabled || value >= 20) return;
    onChange(value + 1);
  }

  return (
    <div className="flex items-center bg-(--color-surface-container-low) rounded-lg p-1">
      <button
        type="button"
        disabled={disabled || value <= 0}
        onClick={decrement}
        className="w-10 h-10 flex items-center justify-center text-(--color-on-surface) hover:bg-(--color-surface-container-high) rounded-lg transition-colors disabled:opacity-30"
      >
        <MaterialIcon icon="remove" size={20} />
      </button>
      <span className="w-10 text-center text-2xl font-bold text-(--color-on-surface)">
        {value}
      </span>
      <button
        type="button"
        disabled={disabled}
        onClick={increment}
        className="w-10 h-10 flex items-center justify-center text-(--color-on-surface) hover:bg-(--color-surface-container-high) rounded-lg transition-colors disabled:opacity-30"
      >
        <MaterialIcon icon="add" size={20} />
      </button>
    </div>
  );
}

// Individual match card with local prediction state
function MatchCard({
  match,
  prediction,
}: {
  match: Match;
  prediction: Prediction | undefined;
}) {
  const [home, setHome] = useState(prediction?.predictedHome ?? 0);
  const [away, setAway] = useState(prediction?.predictedAway ?? 0);

  // Prefill from the saved prediction when it arrives (it may load after this card mounts).
  useEffect(() => {
    setHome(prediction?.predictedHome ?? 0);
    setAway(prediction?.predictedAway ?? 0);
  }, [prediction?.predictedHome, prediction?.predictedAway]);

  const isDirty = home !== (prediction?.predictedHome ?? 0) || away !== (prediction?.predictedAway ?? 0);

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const isLocked = isLive || isFinished;

  const upsert = useUpsertPrediction(match.id);

  async function save() {
    await upsert.mutateAsync({ predictedHome: home, predictedAway: away });
  }

  return (
    <div
      className={cn(
        'rounded-xl p-4 border transition-transform active:scale-[0.99] relative',
        isLocked
          ? 'bg-(--color-surface-container-lowest) border-(--color-outline-variant) opacity-80'
          : 'bg-white shadow-[0px_4px_12px_rgba(0,0,0,0.05)] border-(--color-surface-container-high)',
      )}
    >
      {/* Status row */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {isLive ? (
            <Badge variant="live">LIVE</Badge>
          ) : isFinished ? (
            <Badge variant="muted">FINALIZADO</Badge>
          ) : (
            <Badge variant="default">PRÓXIMO</Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isLocked && (
            <MaterialIcon icon="lock" className="text-(--color-outline) text-[18px]" />
          )}
          <span className="text-xs text-(--color-on-surface-variant)">
            {formatKickoff(match.kickoff)}
          </span>
        </div>
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between gap-4">
        {/* Home */}
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="flex items-center justify-center mb-2 h-10">
            <TeamFlag name={match.homeTeam} />
          </div>
          <p className="text-sm font-bold truncate w-full">{match.homeTeam}</p>
        </div>

        {/* Score / steppers */}
        {isLocked ? (
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black tracking-tight text-(--color-on-surface)">
              {match.homeScore ?? '-'}
            </span>
            <span className="text-xl font-bold text-(--color-outline-variant)">-</span>
            <span className="text-4xl font-black tracking-tight text-(--color-on-surface)">
              {match.awayScore ?? '-'}
            </span>
          </div>
        ) : (
          <>
            <ScoreStepper value={home} onChange={setHome} disabled={isLocked} />
            <span className="text-xl font-bold text-(--color-outline-variant) px-1">vs</span>
            <ScoreStepper value={away} onChange={setAway} disabled={isLocked} />
          </>
        )}

        {/* Away */}
        <div className="flex flex-col items-center flex-1 text-center">
          <div className="flex items-center justify-center mb-2 h-10">
            <TeamFlag name={match.awayTeam} />
          </div>
          <p className="text-sm font-bold truncate w-full">{match.awayTeam}</p>
        </div>
      </div>

      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 bg-(--color-surface)/10 rounded-xl cursor-not-allowed" />
      )}

      {/* Inline save for this card */}
      {!isLocked && isDirty && (
        <button
          onClick={save}
          disabled={upsert.isPending}
          className="mt-3 w-full h-10 bg-(--color-stadium-green-light)/10 text-(--color-stadium-green-light) font-bold text-sm rounded-lg hover:bg-(--color-stadium-green-light) hover:text-white transition-colors"
        >
          {upsert.isPending ? 'Guardando...' : 'Guardar predicción'}
        </button>
      )}
    </div>
  );
}

function MatchesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-36 bg-(--color-surface-container) rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
}

function MatchesError() {
  return (
    <div className="text-center py-12 text-(--color-on-surface-variant)">
      <MaterialIcon icon="error" className="text-5xl mb-3 text-(--color-score-red)" />
      <p className="text-base font-medium">No se pudieron cargar los partidos. Reintenta.</p>
    </div>
  );
}

function MatchList({ matches, predictions }: { matches: Match[]; predictions: Prediction[] }) {
  const predMap = new Map(predictions.map((p) => [p.matchId, p]));

  if (!matches.length) {
    return (
      <div className="text-center py-12 text-(--color-on-surface-variant)">
        <MaterialIcon icon="sports_soccer" className="text-5xl mb-3" />
        <p className="text-base font-medium">No hay partidos en esta sección.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} prediction={predMap.get(m.id)} />
      ))}
    </div>
  );
}

export default function MatchesPage() {
  const [tab, setTab] = useState<MatchStatus>('upcoming');

  const upcomingQ = useMatches('upcoming');
  const liveQ = useMatches('live');
  const finishedQ = useMatches('finished');
  const predictionsQ = useMyPredictions();

  const upcoming = upcomingQ.data ?? [];
  const live = liveQ.data ?? [];
  const finished = finishedQ.data ?? [];
  const predictions = predictionsQ.data ?? [];

  function renderTabContent(status: MatchStatus) {
    const q = status === 'upcoming' ? upcomingQ : status === 'live' ? liveQ : finishedQ;
    const matches = status === 'upcoming' ? upcoming : status === 'live' ? live : finished;
    if (q.isLoading) return <MatchesSkeleton />;
    if (q.isError) return <MatchesError />;
    return <MatchList matches={matches} predictions={predictions} />;
  }

  return (
    <div className="mt-6">
      {/* Hero */}
      <div className="relative h-32 w-full rounded-xl overflow-hidden mb-6 bg-(--color-stadium-green-dark)">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,#4C9141,transparent)]" />
        <div className="absolute inset-0 flex flex-col justify-center px-4 text-white z-10">
          <h2 className="text-2xl font-bold">Predicciones del Mundial</h2>
          <p className="text-base opacity-90">¡Predice antes del pitido inicial!</p>
        </div>
        <MaterialIcon
          icon="sports_soccer"
          className="absolute right-4 bottom-4 text-white/10 text-[80px]"
        />
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as MatchStatus)}>
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">
            Próximos {upcoming.length > 0 && `(${upcoming.length})`}
          </TabsTrigger>
          <TabsTrigger value="live">
            En Vivo{' '}
            {live.length > 0 && (
              <span className="ml-1 w-2 h-2 rounded-full bg-(--color-score-red) animate-pulse inline-block" />
            )}
          </TabsTrigger>
          <TabsTrigger value="finished">Finalizados</TabsTrigger>
        </TabsList>

        {(['upcoming', 'live', 'finished'] as const).map((s) => (
          <TabsContent key={s} value={s}>
            {renderTabContent(s)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
