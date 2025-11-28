import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('=== API Error Interceptor ===');
    console.log('Status:', error.response?.status);
    console.log('URL:', error.config?.url);
    
    if (error.response?.status === 401) {
      const requestUrl = error.config?.url || '';
      const isAuthApiRequest = requestUrl.includes('/auth/login') || 
                               requestUrl.includes('/auth/register');
      
      console.log('Is auth request:', isAuthApiRequest);
      
      if (!isAuthApiRequest) {
        console.log('Redirecting to /login...');
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } else {
        console.log('Skipping redirect, letting error bubble up');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
