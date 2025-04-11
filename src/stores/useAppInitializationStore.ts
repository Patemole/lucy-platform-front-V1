import { create } from 'zustand';

interface AppInitializationState {
  /** Indique si les chargements initiaux essentiels de l'application (infos user, chats) ont été tentés. */
  isAppInitialized: boolean;
  /** Marque l'application comme initialisée (ou tentative d'initialisation terminée). */
  setAppInitialized: (status: boolean) => void;
}

/**
 * Store pour gérer l'état global de l'initialisation de l'application.
 */
export const useAppInitializationStore = create<AppInitializationState>((set) => ({
  isAppInitialized: false,
  setAppInitialized: (status) => {
    console.log(`[AppInitializationStore] Setting isAppInitialized to: ${status}`);
    set({ isAppInitialized: status });
  },
})); 