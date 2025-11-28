import { useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import type { LoginRequest, RegisterRequest } from '../types';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, isLoading, setAuth, logout: storeLogout } = useAuthStore();

  // Fetch current user if we have a token but no user
  const { data: currentUser, isLoading: isUserLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: !!token && !user,
    retry: false,
  });

  // Update store when we fetch user data
  useEffect(() => {
    if (currentUser && token) {
      setAuth(currentUser, token);
    }
  }, [currentUser, token, setAuth]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: async (data) => {
      // First set the token, then fetch user
      useAuthStore.getState().setAuth({ id: '', email: '', full_name: '', business_name: null, is_active: true, created_at: '' }, data.access_token);
      const user = await authApi.getMe();
      setAuth(user, data.access_token);
      navigate('/');
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      navigate('/login');
    },
  });

  const login = useCallback((data: LoginRequest) => {
    return loginMutation.mutateAsync(data);
  }, [loginMutation]);

  const register = useCallback((data: RegisterRequest) => {
    return registerMutation.mutateAsync(data);
  }, [registerMutation]);

  const logout = useCallback(() => {
    storeLogout();
    queryClient.clear();
    navigate('/login');
  }, [storeLogout, queryClient, navigate]);

  return {
    user: user || currentUser,
    token,
    isAuthenticated,
    isLoading: isLoading || isUserLoading,
    login,
    register,
    logout,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}

export default useAuth;
