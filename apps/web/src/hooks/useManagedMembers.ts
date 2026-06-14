import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { queryClient } from '@/lib/queryClient';
import type { User } from '@the-prophet/shared';

// Stable query keys
export const managedMembersKeys = {
  all: ['managed-members'] as const,
  list: () => [...managedMembersKeys.all, 'list'] as const,
};

export function useManagedMembers() {
  return useQuery({
    queryKey: managedMembersKeys.list(),
    queryFn: ({ signal }) => api.get<User[]>('/api/me/managed-members', signal),
  });
}

export function useCreateManagedMember() {
  return useMutation({
    mutationFn: (data: { displayName: string }) =>
      api.post<User>('/api/me/managed-members', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: managedMembersKeys.list() }),
  });
}

export function useManagedMemberAccessLink() {
  return useMutation({
    mutationFn: (id: string) =>
      api.post<{ url: string; token: string }>(`/api/managed-members/${id}/access-link`),
  });
}
