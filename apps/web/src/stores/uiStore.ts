import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeGroupId: null,
      setActiveGroupId: (activeGroupId) => set({ activeGroupId }),
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
    }),
    { name: 'the-prophet-ui' },
  ),
);
