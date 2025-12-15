import { create } from 'zustand';

interface AppState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isAiModalOpen: boolean;
  toggleAiModal: () => void;
}

export const useStore = create<AppState>((set) => ({
  isDarkMode: true, // Default to dark as per guidelines
  toggleTheme: () => set((state) => {
    const newMode = !state.isDarkMode;
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { isDarkMode: newMode };
  }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isAiModalOpen: false,
  toggleAiModal: () => set((state) => ({ isAiModalOpen: !state.isAiModalOpen })),
}));