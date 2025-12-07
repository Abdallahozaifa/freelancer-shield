import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

interface GoogleSignInButtonProps {
  onSuccess?: (isNewUser: boolean) => void;
  onError?: (error: string) => void;
  mode?: 'signin' | 'signup';
  className?: string;
  variant?: 'default' | 'icon-only'; // For mobile icon-only buttons
}

export function GoogleSignInButton({ 
  onSuccess, 
  onError, 
  mode = 'signin',
  className = '',
  variant = 'default'
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) {
      onError?.('No credential received from Google');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authApi.googleAuth(credentialResponse.credential);
      
      // Store auth state
      setAuth(response.user, response.access_token);
      
      // Callback
      onSuccess?.(response.is_new_user);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Google auth error:', error);
      const message = error.response?.data?.detail || 'Google sign-in failed. Please try again.';
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    onError?.('Google sign-in was cancelled or failed');
  };

  // For icon-only variant (mobile), use a custom styled button
  if (variant === 'icon-only') {
    return (
      <div className={className}>
        {isLoading ? (
          <button
            disabled
            className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center cursor-not-allowed"
          >
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          </button>
        ) : (
          <div className="relative">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              theme="filled_blue"
              size="large"
              width="48"
              text=""
              shape="circle"
            />
          </div>
        )}
      </div>
    );
  }

  // Default variant - full button
  if (isLoading) {
    return (
      <button
        disabled
        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-slate-400 bg-slate-50 cursor-not-allowed ${className}`}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm font-medium">Connecting...</span>
      </button>
    );
  }

  return (
    <div className={className}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        useOneTap={false}
        theme="outline"
        size="large"
        width="100%"
        text={mode === 'signup' ? 'signup_with' : 'signin_with'}
        shape="rectangular"
      />
    </div>
  );
}

