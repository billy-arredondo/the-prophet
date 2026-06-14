import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import type { Group } from '@the-prophet/shared';
import type { CreateGroupInput, JoinGroupInput } from '@the-prophet/shared';

// Stable query keys — co-located with the hook (bundle-barrel-imports pattern)
export const groupKeys = {
  all: ['groups'] as const,
  list: () => [...groupKeys.all, 'list'] as const,
  detail: (id: string) => [...groupKeys.all, 'detail', id] as const,
};

export function useGroups() {
  return useQuery({
    queryKey: groupKeys.list(),
    queryFn: ({ signal }) => api.get<Group[]>('/api/groups', signal),
  });
}

export function useGroup(groupId: string) {
  return useQuery({
    queryKey: groupKeys.detail(groupId),
    queryFn: ({ signal }) => api.get<Group>(`/api/groups/${groupId}`, signal),
    enabled: Boolean(groupId),
  });
}

export function useCreateGroup() {
  return useMutation({
    mutationFn: (data: CreateGroupInput) => api.post<Group>('/api/groups', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupKeys.list() }),
  });
}

export function useJoinGroup() {
  return useMutation({
    mutationFn: (data: JoinGroupInput) => api.post<Group>('/api/groups/join', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: groupKeys.list() }),
  });
}
