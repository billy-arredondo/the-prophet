import { create } from 'zustand';

interface UiState {
  activeGroupId: string | null;
  setActiveGroupId: (id: string | null) => void;
}

export const useUiStore = create<UiState>((set) => ({
  activeGroupId: null,
  setActiveGroupId: (activeGroupId) => set({ activeGroupId }),
}));
