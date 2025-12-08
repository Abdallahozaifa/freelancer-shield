import { apiClient } from './client';
import type {
  User,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  GoogleAuthRequest,
  GoogleAuthResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
  VerifyResetTokenResponse,
} from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<TokenResponse> => {
    // Backend expects JSON with email/password
    const response = await apiClient.post<TokenResponse>('/auth/login', {
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>('/auth/register', data);
    return response.data;
  },

  googleAuth: async (credential: string): Promise<GoogleAuthResponse> => {
    const response = await apiClient.post<GoogleAuthResponse>('/auth/google', {
      credential,
    });
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    const response = await apiClient.post<ForgotPasswordResponse>(
      '/auth/forgot-password',
      { email }
    );
    return response.data;
  },

  resetPassword: async (
    token: string,
    newPassword: string
  ): Promise<ResetPasswordResponse> => {
    const response = await apiClient.post<ResetPasswordResponse>(
      '/auth/reset-password',
      { token, new_password: newPassword }
    );
    return response.data;
  },

  verifyResetToken: async (
    token: string
  ): Promise<VerifyResetTokenResponse> => {
    const response = await apiClient.post<VerifyResetTokenResponse>(
      '/auth/verify-reset-token',
      { token }
    );
    return response.data;
  },
};

export default authApi;
