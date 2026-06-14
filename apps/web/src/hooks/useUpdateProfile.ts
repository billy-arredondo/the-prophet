import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@the-prophet/shared';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { displayName?: string; photoURL?: string }) =>
      api.patch<User>('/api/me', data),
    onSuccess: (updated) => {
      useAuthStore.getState().setUser(updated);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}
