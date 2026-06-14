import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UiState {
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      activeGroupId: null,
      setActiveGroupId: (activeGroupId) => set({ activeGroupId }),
    }),
    { name: 'the-prophet-ui' },
  ),
);
