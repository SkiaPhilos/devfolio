import { create } from 'zustand';

interface UIState {
  // UI state
  hoveredObject: string | null;
  setHoveredObject: (name: string | null) => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingProgress: number;
  setLoadingProgress: (progress: number) => void;

  // Camera state
  introComplete: boolean;
  setIntroComplete: (complete: boolean) => void;

  // Interaction state
  lastClickedObject: string | null;
  setLastClickedObject: (name: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // UI state
  hoveredObject: null,
  setHoveredObject: (name) => set({ hoveredObject: name }),

  // Loading state
  isLoading: true,
  setIsLoading: (loading) => set({ isLoading: loading }),
  loadingProgress: 0,
  setLoadingProgress: (progress) => set({ loadingProgress: progress }),

  // Camera state
  introComplete: false,
  setIntroComplete: (complete) => set({ introComplete: complete }),

  // Interaction state
  lastClickedObject: null,
  setLastClickedObject: (name) => set({ lastClickedObject: name }),
}));
