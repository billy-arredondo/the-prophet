import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { RankingEntry } from '@the-prophet/shared';

export const rankingKeys = {
  all: ['ranking'] as const,
  byGroup: (groupId: string) => [...rankingKeys.all, groupId] as const,
};

export function useRanking(groupId: string) {
  return useQuery({
    queryKey: rankingKeys.byGroup(groupId),
    queryFn: ({ signal }) =>
      api.get<RankingEntry[]>(`/api/groups/${groupId}/rankings`, signal),
    enabled: Boolean(groupId),
    staleTime: 2 * 60 * 1000, // Rankings update less often
  });
}
