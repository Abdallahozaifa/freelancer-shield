import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  PieChart,
  Settings,
  Bell,
  Search,
  Menu,
  Lock,
  Shield,
  Mail,
} from 'lucide-react';
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
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((e: any) => e.msg || e.message || String(e)).join(', ');
  if (detail && typeof detail === 'object') return detail.msg || detail.message || JSON.stringify(detail);
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
    <div className="min-h-screen">
      
      {/* ============================================ */}
      {/* MOBILE LAYOUT - Only visible below lg */}
      {/* ============================================ */}
      <div className="lg:hidden min-h-screen flex flex-col bg-white">
        
        {/* Top Section - Gradient with curved bottom - REDUCED HEIGHT */}
        <div className="relative h-[25vh] min-h-[180px] max-h-[200px] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 overflow-visible">
          
          {/* Navigation Row - Back button + ScopeGuard Branding */}
          <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10">
            {/* Back button */}
            <Link 
              to="/" 
              className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            
            {/* ScopeGuard Branding */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">ScopeGuard</span>
            </Link>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-20 left-8 w-24 h-24 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
          
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
          
          {/* Curved bottom edge - Overlapping to prevent line */}
          <div className="absolute -bottom-px left-0 right-0">
            <svg viewBox="0 0 1440 80" className="w-full h-[50px] fill-white block" preserveAspectRatio="none">
              <path d="M0,40 C360,90 720,0 1080,60 C1260,80 1380,40 1440,40 L1440,80 L0,80 Z" />
            </svg>
          </div>
          
          {/* Floating icon - SAFE POSITION */}
          <div className="absolute bottom-0 right-8 translate-y-1/2 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/30 rotate-12 z-20">
            <Shield className="w-6 h-6 text-white -rotate-12" />
          </div>
        </div>
        
        {/* Bottom Section - White with form - Seamless connection */}
        <div className="flex-1 bg-white px-5 pt-5 relative -mt-2">
          
          {/* Header - Compact */}
          <div className="mb-4 pr-12">
            <h1 className="text-2xl font-bold text-slate-900 mb-0.5">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-sm">
              Login to your account
            </p>
          </div>
          
          {/* Form - Tighter spacing */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {error && (
              <Alert type="error" className="animate-fade-in mb-4">
                {error}
              </Alert>
            )}

            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Email address"
                disabled={isSubmitting}
                {...register('email')}
                className={`pl-10 pr-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-sm ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600 -mt-1">{errors.email.message}</p>
            )}

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Password"
                disabled={isSubmitting}
                {...register('password')}
                className={`pl-10 pr-10 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-sm ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600 -mt-1">{errors.password.message}</p>
            )}

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-medium text-indigo-600">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider - Compact */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Social Login - Inline */}
          <div className="flex justify-center gap-3">
            <button className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            <button className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-100 transition-colors">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-4 mb-4 text-center text-slate-600 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* DESKTOP LAYOUT - Only visible at lg and above */}
      {/* ============================================ */}
      <div className="hidden lg:flex min-h-screen bg-white">
      
      {/* --- Left Panel: Dashboard Preview & Brand --- */}
      <div className="lg:w-[50%] bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-12 text-white">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 z-0" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />

        {/* Dashboard Mockup Container - Centered */}
        <div className="relative z-10 w-full max-w-2xl mx-auto transform -rotate-2 hover:rotate-0 transition-transform duration-700 ease-out perspective-1000">
          <div className="bg-slate-900/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
            
            {/* Mockup Header */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="h-2 w-32 bg-white/10 rounded-full" />
              <div className="flex gap-3">
                <Search className="w-4 h-4 text-white/30" />
                <Bell className="w-4 h-4 text-white/30" />
                <div className="w-5 h-5 rounded-full bg-indigo-500/50" />
              </div>
            </div>

            <div className="flex h-[400px]">
              {/* Mockup Sidebar */}
              <div className="w-16 border-r border-white/5 flex flex-col items-center py-4 gap-6 bg-white/[0.02]">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400"><LayoutDashboard className="w-5 h-5" /></div>
                <div className="p-2 rounded-lg hover:bg-white/5 text-white/40"><PieChart className="w-5 h-5" /></div>
                <div className="p-2 rounded-lg hover:bg-white/5 text-white/40"><Menu className="w-5 h-5" /></div>
                <div className="mt-auto p-2 rounded-lg hover:bg-white/5 text-white/40"><Settings className="w-5 h-5" /></div>
              </div>

              {/* Mockup Content */}
              <div className="flex-1 p-6 space-y-6 bg-slate-900/50">
                {/* Hero Stats */}
                <div className="flex gap-4">
                  <div className="flex-1 p-4 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                    <p className="text-xs text-indigo-200 mb-1">Revenue Protected</p>
                    <p className="text-2xl font-bold text-white">$12,450</p>
                    <div className="mt-2 h-1 w-full bg-indigo-900/50 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-indigo-400 rounded-full" />
                    </div>
                  </div>
                  <div className="w-1/3 p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs text-slate-400 mb-1">Active Projects</p>
                    <p className="text-2xl font-bold text-white">8</p>
                  </div>
                </div>

                {/* Project List */}
                <div className="space-y-3">
                  <div className="flex justify-between text-xs text-slate-500 px-2 uppercase tracking-wider">
                    <span>Project</span>
                    <span>Status</span>
                  </div>
                  {[
                    { name: 'Website Redesign', status: 'Active', color: 'bg-emerald-500' },
                    { name: 'Mobile App API', status: 'Scope Creep', color: 'bg-amber-500' },
                    { name: 'Q4 Marketing', status: 'Active', color: 'bg-emerald-500' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${p.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} style={{ boxShadow: `0 0 10px ${p.color}` }} />
                        <span className="text-sm text-slate-200">{p.name}</span>
                      </div>
                      <div className="h-1.5 w-16 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 bg-slate-500/50 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Badge */}
          <div className="absolute -bottom-6 -right-6 bg-white text-slate-900 p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
            <div className="bg-green-100 p-2 rounded-full text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Status Update</p>
              <p className="text-sm font-bold">Proposal Accepted!</p>
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div className="absolute bottom-12 left-12 z-20">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <span className="font-bold text-xl tracking-tight">ScopeGuard</span>
          </div>
          <p className="text-slate-400 text-sm max-w-xs">
            The professional tool for freelancers to track scope, manage requests, and protect revenue.
          </p>
        </div>
      </div>

      {/* --- Right Panel: Login Form - Enhanced --- */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
        {/* Professional gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
        
        {/* Soft decorative orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-100/30 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-16 w-64 h-64 bg-purple-100/30 rounded-full filter blur-3xl pointer-events-none" />
        
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent" />
        
        <div className="w-full max-w-md mx-auto space-y-5 sm:space-y-6 relative z-10 -mt-12">
          
          {/* Desktop Logo - Centered above form */}
          <div className="flex justify-center mb-6">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Shield className="w-5 h-5 text-white" />
            </div>
              <span className="font-bold text-xl text-slate-900">ScopeGuard</span>
            </Link>
          </div>

          {/* Form Card - Enhanced styling with better definition */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-6 sm:p-8">
            {/* Desktop Header - Centered inside card */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">Welcome back</h1>
            <p className="text-slate-500">
                Enter your credentials to access your workspace
            </p>
          </div>

          {error && (
              <Alert type="error" className="animate-fade-in mb-4">
              {error}
            </Alert>
          )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field - With icon */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  disabled={isSubmitting}
                  {...register('email')}
                    className={`pl-11 h-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1.5">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field - With icon */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    {...register('password')}
                    className={`pl-11 pr-12 h-12 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1.5">{errors.password.message}</p>
                )}
            </div>

              {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                {...register('rememberMe')}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors"
              />
                <label htmlFor="remember-me" className="ml-2.5 block text-sm text-slate-600 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

              {/* Submit Button - Enhanced with prominent shadow */}
            <Button
              type="submit"
              disabled={isSubmitting}
                className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                    <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

            {/* Social Login Options - Desktop only */}
            <div className="mt-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 backdrop-blur-sm text-slate-500">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm">Google</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="text-sm">GitHub</span>
                </button>
              </div>
            </div>

            {/* Sign Up Link - Inside card */}
            <p className="mt-6 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Start for free
              </Link>
            </p>
          </div>
          
          {/* Security Badges - Centered below card */}
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
             <div className="flex items-center gap-1">
               <Lock className="w-3 h-3" />
              <span>Secure SSL</span>
             </div>
             <span>•</span>
            <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
             <span>•</span>
            <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;