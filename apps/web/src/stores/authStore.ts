import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  _hasHydrated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      _hasHydrated: false,
      setAuth: (user, token) => set({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      }),
      logout: () => set({ 
        user: null, 
        token: null, 
        isAuthenticated: false, 
        isLoading: false 
      }),
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null
      })),
      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (_hasHydrated) => set({ _hasHydrated }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth hydration error:', error);
          state?.setLoading(false);
          state?.setHasHydrated(true);
          return;
        }
        
        if (state) {
          state.setHasHydrated(true);
          // If no token, we're done loading
          // If token exists, useAuth will handle fetching user and setting isLoading to false
          if (!state.token) {
            state.setLoading(false);
          }
        }
      },
    }
  )
);

// Helper to wait for hydration
export const waitForHydration = () => {
  return new Promise<void>((resolve) => {
    if (useAuthStore.getState()._hasHydrated) {
      resolve();
      return;
    }
    
    const unsub = useAuthStore.subscribe((state) => {
      if (state._hasHydrated) {
        unsub();
        resolve();
      }
    });
  });
};

export default useAuthStore;
