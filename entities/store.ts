import { create } from 'zustand';

export interface ZenResponse {
  thought_trace: string;
  realm: string;
  advice: string;
  action_intent: 'SET_TIMER' | 'PLAY_BINAURAL' | 'NONE';
}

interface AppState {
  isProcessing: boolean;
  currentResponse: ZenResponse | null;
  setProcessing: (status: boolean) => void;
  setResponse: (response: ZenResponse) => void;
}

export const useStore = create<AppState>((set) => ({
  isProcessing: false,
  currentResponse: null,
  setProcessing: (status) => set({ isProcessing: status }),
  setResponse: (response) => set({ currentResponse: response }),
}));