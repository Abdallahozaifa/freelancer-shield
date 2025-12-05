import { useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';

/**
 * AuthInitializer - Handles fetching user data on app load
 * This runs at the app level to ensure auth state is resolved
 * before any route guards check authentication.
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { token, user, setAuth, logout, setLoading, _hasHydrated } = useAuthStore();
  const hasFetchedUser = useRef(false);

  useEffect(() => {
    const initAuth = async () => {
      // Wait for store to hydrate from localStorage
      if (!_hasHydrated) return;

      // If no token, we're done - not authenticated
      if (!token) {
        setLoading(false);
        return;
      }

      // If we already have user data, we're done
      if (user) {
        setLoading(false);
        return;
      }

      // Only fetch once
      if (hasFetchedUser.current) return;
      hasFetchedUser.current = true;

      // Fetch user data with the stored token
      try {
        const userData = await authApi.getMe();
        setAuth(userData, token);
      } catch (error) {
        // Token is invalid, clear auth state
        console.error('Failed to fetch user:', error);
        logout();
      }
    };

    initAuth();
  }, [_hasHydrated, token, user, setAuth, logout, setLoading]);

  return <>{children}</>;
}

export default AuthInitializer;
