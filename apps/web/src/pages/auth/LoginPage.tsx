import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

function getErrorMessage(err: any): string {
  const detail = err?.response?.data?.detail;
  
  if (typeof detail === 'string') {
    return detail;
  }
  
  if (Array.isArray(detail)) {
    return detail.map((e: any) => e.msg || e.message || String(e)).join(', ');
  }
  
  if (detail && typeof detail === 'object') {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  
  return err?.message || 'Invalid email or password. Please try again.';
}

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (isSubmitting) return;
    
    setError(null);
    setIsSubmitting(true);
    
    try {
      const tokenResponse = await authApi.login({ 
        email: data.email, 
        password: data.password 
      });
      
      useAuthStore.setState({ token: tokenResponse.access_token });
      const userData = await authApi.getMe();
      setAuth(userData, tokenResponse.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 relative overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-indigo-500/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        
        {/* Dashboard Mockup Illustration */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 w-[600px] opacity-30">
          {/* Mockup Container */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-4 shadow-2xl">
            {/* Header Bar */}
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/50" />
              <div className="flex-1">
                <div className="h-3 w-24 bg-white/30 rounded" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/20" />
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/10 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/30 mb-2" />
                  <div className="h-4 w-12 bg-white/40 rounded mb-1" />
                  <div className="h-2 w-16 bg-white/20 rounded" />
                </div>
              ))}
            </div>
            
            {/* Project Cards */}
            <div className="space-y-3">
              {[
                { progress: 75, status: 'emerald' },
                { progress: 45, status: 'amber' },
                { progress: 90, status: 'emerald' },
              ].map((project, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-3 w-32 bg-white/30 rounded" />
                    <div className={`h-5 w-16 rounded-full ${
                      project.status === 'emerald' ? 'bg-emerald-500/40' : 'bg-amber-500/40'
                    }`} />
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-400/60 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="h-2 w-20 bg-white/20 rounded" />
                    <div className="h-2 w-16 bg-white/15 rounded" />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Scope Items Preview */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-3 w-20 bg-white/30 rounded" />
              </div>
              <div className="space-y-2">
                {[true, true, false, true].map((checked, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border-2 ${
                      checked ? 'bg-emerald-500/50 border-emerald-400/50' : 'border-white/30'
                    }`} />
                    <div className={`h-2 rounded ${
                      checked ? 'w-28 bg-white/20' : 'w-36 bg-white/30'
                    }`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ScopeGuard</h1>
              <p className="text-indigo-300 text-sm">Freelancer Edition</p>
            </div>
          </div>
          
          <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
            Protect your projects<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              from scope creep
            </span>
          </h2>
          
          <p className="text-lg text-indigo-200/80 max-w-md mb-12">
            Track scope, detect out-of-scope requests, and create proposals to protect your revenue.
          </p>
          
          {/* Features */}
          <div className="space-y-4">
            {[
              'AI-powered scope analysis',
              'Automatic proposal generation',
              'Real-time project tracking',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-400/30">
                  <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-indigo-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-4">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">ScopeGuard</h1>
            <p className="text-slate-500 text-sm">Protect your projects from scope creep</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/60 p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-slate-500 mt-1">Sign in to your account to continue</p>
            </div>

            {error && (
              <div className="mb-6">
                <Alert type="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                  {...register('email')}
                  className={errors.email ? 'border-red-500 focus:ring-red-500' : ''}
                />
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    {...register('password')}
                    className={`pr-11 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-slate-500 hover:text-slate-700 hover:underline">
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-slate-500 hover:text-slate-700 hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
