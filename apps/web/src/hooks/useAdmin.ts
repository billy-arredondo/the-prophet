import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import type { Match } from '@the-prophet/shared';
import { matchKeys } from '@/hooks/useMatches';
import { predictionKeys } from '@/hooks/usePredictions';
import { rankingKeys } from '@/hooks/useRanking';

export const adminKeys = {
  all: ['admin'] as const,
  pendingReview: () => [...adminKeys.all, 'pending-review'] as const,
};

export function usePendingReview() {
  return useQuery({
    queryKey: adminKeys.pendingReview(),
    queryFn: ({ signal }) => api.get<Match[]>('/api/matches/pending-review', signal),
  });
}

function invalidateAfterResult() {
  queryClient.invalidateQueries({ queryKey: adminKeys.all });
  queryClient.invalidateQueries({ queryKey: matchKeys.all });
  queryClient.invalidateQueries({ queryKey: predictionKeys.all });
  queryClient.invalidateQueries({ queryKey: rankingKeys.all });
}

export function useConfirmResult() {
  return useMutation({
    mutationFn: (vars: { matchId: string; homeScore?: number; awayScore?: number }) =>
      api.post<Match>(`/api/matches/${vars.matchId}/confirm-result`, {
        homeScore: vars.homeScore,
        awayScore: vars.awayScore,
      }),
    onSuccess: invalidateAfterResult,
  });
}

export function useOverrideResult() {
  return useMutation({
    mutationFn: (vars: { matchId: string; homeScore: number; awayScore: number }) =>
      api.patch<Match>(`/api/matches/${vars.matchId}/result`, {
        homeScore: vars.homeScore,
        awayScore: vars.awayScore,
      }),
    onSuccess: invalidateAfterResult,
  });
}
