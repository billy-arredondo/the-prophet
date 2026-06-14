import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Match, MatchStatus } from '@the-prophet/shared';

export const matchKeys = {
  all: ['matches'] as const,
  byStatus: (status: MatchStatus) => [...matchKeys.all, status] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
};

export function useMatches(status?: MatchStatus) {
  const endpoint = status ? `/api/matches?status=${status}` : '/api/matches';
  return useQuery({
    queryKey: status ? matchKeys.byStatus(status) : matchKeys.all,
    queryFn: ({ signal }) => api.get<Match[]>(endpoint, signal),
    // Live matches need more frequent updates
    refetchInterval: status === 'live' ? 30_000 : false,
  });
}

export function useAllMatches() {
  const upcoming = useMatches('upcoming');
  const live = useMatches('live');
  const finished = useMatches('finished');
  return { upcoming, live, finished };
}
