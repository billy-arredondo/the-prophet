import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Tournament } from '@the-prophet/shared';

export const tournamentKeys = {
  all: ['tournaments'] as const,
};

export function useTournaments() {
  return useQuery({
    queryKey: tournamentKeys.all,
    queryFn: ({ signal }) => api.get<Tournament[]>('/api/tournaments', signal),
  });
}

/** The active tournament (or the most recent one) — used as the default for new groups. */
export function useActiveTournament(): Tournament | undefined {
  const { data } = useTournaments();
  return data?.find((t) => t.status === 'active') ?? data?.[0];
}
