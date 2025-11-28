import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import type { User, RegisterRequest } from '../types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate();
  const { 
    user, 
    token,
    isAuthenticated, 
    isLoading, 
    setAuth, 
    logout: storeLogout, 
    updateUser,
    setLoading 
  } = useAuthStore();

  // Track if we've already tried to fetch user
  const hasFetchedUser = useRef(false);

  // Fetch user on mount if we have a token but no user
  useEffect(() => {
    const fetchUser = async () => {
      // Only fetch once, and only if we have a token but no user
      if (token && !user && !hasFetchedUser.current) {
        hasFetchedUser.current = true;
        setLoading(true);
        try {
          const userData = await authApi.getMe();
          setAuth(userData, token);
        } catch (error) {
          // Token is invalid, clear auth
          storeLogout();
        }
      }
    };
    fetchUser();
  }, [token, user, setAuth, storeLogout, setLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      // Don't set loading here - it can cause re-renders that reset component state
      try {
        // Get token
        const tokenResponse = await authApi.login({ email, password });
        
        // Temporarily set token to make authenticated request
        useAuthStore.setState({ token: tokenResponse.access_token });
        
        // Get user data
        const userData = await authApi.getMe();
        
        // Set full auth state
        setAuth(userData, tokenResponse.access_token);
        
        navigate('/dashboard');
      } catch (error) {
        // Don't call setLoading here - just throw the error
        throw error;
      }
    },
    [navigate, setAuth]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        // Register user
        await authApi.register(data);
        
        // Auto-login after registration
        const tokenResponse = await authApi.login({ 
          email: data.email, 
          password: data.password 
        });
        
        // Temporarily set token
        useAuthStore.setState({ token: tokenResponse.access_token });
        
        // Get user data
        const userData = await authApi.getMe();
        
        // Set full auth state
        setAuth(userData, tokenResponse.access_token);
        
        navigate('/dashboard');
      } catch (error) {
        throw error;
      }
    },
    [navigate, setAuth]
  );

  const logout = useCallback(() => {
    storeLogout();
    navigate('/login');
  }, [storeLogout, navigate]);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      // Optimistic update
      updateUser(data);
    },
    [updateUser]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };
}

export default useAuth;
