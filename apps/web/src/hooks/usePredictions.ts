import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import type { Prediction } from '@the-prophet/shared';
import type { UpsertPredictionInput } from '@the-prophet/shared';

export const predictionKeys = {
  all: ['predictions'] as const,
  byMatch: (matchId: string) => [...predictionKeys.all, 'match', matchId] as const,
  mine: () => [...predictionKeys.all, 'mine'] as const,
};

export function useMyPredictions() {
  return useQuery({
    queryKey: predictionKeys.mine(),
    queryFn: ({ signal }) => api.get<Prediction[]>('/api/me/predictions', signal),
  });
}

export function useUpsertPrediction(matchId: string) {
  return useMutation({
    mutationFn: (data: UpsertPredictionInput) =>
      api.put<Prediction>(`/api/matches/${matchId}/prediction`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: predictionKeys.mine() });
      queryClient.invalidateQueries({ queryKey: predictionKeys.byMatch(matchId) });
    },
  });
}
