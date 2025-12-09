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
import { CustomGoogleButton } from '../../components/auth/CustomGoogleButton';

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="min-h-screen lg:flex">
        
        {/* ============================================ */}
        {/* LEFT PANEL - Desktop only - PRESERVED EXACTLY */}
        {/* ============================================ */}
        <div className="hidden lg:flex lg:w-[50%] bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-12 text-white">
        
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

        {/* ============================================ */}
        {/* RIGHT SIDE - Mobile header + Shared form */}
        {/* ============================================ */}
        <div className="flex-1 flex flex-col bg-white">
          
          {/* MOBILE HEADER - Only visible below lg */}
          <div className="lg:hidden relative h-[25vh] min-h-[180px] max-h-[200px] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 overflow-visible">
            
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
          
          {/* FORM CONTAINER - Shared by mobile and desktop */}
          <div className="flex-1 bg-white px-5 lg:px-0 pt-5 lg:pt-0 relative lg:flex lg:items-center lg:justify-center -mt-2 lg:mt-0">
            <div className="w-full lg:max-w-lg lg:mx-auto lg:px-6 lg:py-4">
              
              {/* Desktop logo - only on lg+ */}
              <div className="hidden lg:flex justify-center mb-6">
                <Link to="/" className="inline-flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl text-slate-900">ScopeGuard</span>
                </Link>
              </div>
              
              {/* Mobile header text - only below lg */}
              <div className="lg:hidden mb-4 pr-12">
                <h1 className="text-2xl font-bold text-slate-900 mb-0.5">Welcome Back</h1>
                <p className="text-slate-500 text-sm">Login to your account</p>
              </div>
              
              {/* Form card - styled differently per breakpoint */}
              <div className="lg:bg-white/80 lg:backdrop-blur-sm lg:rounded-2xl lg:shadow-xl lg:shadow-slate-200/50 lg:border lg:border-slate-200/50 lg:p-6">
                
                {/* Desktop header - only on lg+ */}
                <div className="hidden lg:block text-center mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
                  <p className="text-slate-500">Enter your credentials to access your workspace</p>
                </div>
                
                {error && (
                  <Alert type="error" className="animate-fade-in mb-4">{error}</Alert>
                )}
                
                {/* SINGLE FORM - responsive inputs */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 lg:space-y-4">
                  
                  {/* Email - ONE input with responsive styling */}
                  <div>
                    <div className="flex items-center justify-between mb-1 lg:mb-1.5">
                      <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                      {errors.email && <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 lg:pl-3.5 flex items-center pointer-events-none">
                        <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Email address"
                        disabled={isSubmitting}
                        {...register('email')}
                        className={`w-full pl-10 lg:pl-11 pr-4 py-3 lg:h-12 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${errors.email ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-indigo-100 lg:border-slate-200 bg-indigo-50/50 lg:bg-slate-50 focus:bg-white'}`}
                      />
                    </div>
                  </div>
                  
                  {/* Password - ONE input with responsive styling */}
                  <div>
                    <div className="flex items-center justify-between mb-1 lg:mb-1.5">
                      <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                      <div className="flex items-center gap-3">
                        {errors.password && <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>}
                        <Link to="/forgot-password" className="text-xs lg:text-sm font-medium text-indigo-600 hover:text-indigo-500">Forgot?</Link>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 lg:pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Password"
                        disabled={isSubmitting}
                        {...register('password')}
                        className={`w-full pl-10 lg:pl-11 pr-12 py-3 lg:h-12 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${errors.password ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-indigo-100 lg:border-slate-200 bg-indigo-50/50 lg:bg-slate-50 focus:bg-white'}`}
                        style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-1/2 -translate-y-1/2 right-3 p-1 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Remember me */}
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      {...register('rememberMe')}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="remember-me" className="ml-2.5 text-sm text-slate-600 cursor-pointer">
                      Remember me for 30 days
                    </label>
                  </div>
                  
                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30"
                  >
                    {isSubmitting ? (
                      <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Signing in...</>
                    ) : (
                      <>Sign in<ArrowRight className="w-5 h-5 ml-2" /></>
                    )}
                  </Button>
                </form>
                
                {/* Social login */}
                <div className="mt-4 lg:mt-4">
                  <div className="relative mb-3 lg:mb-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white lg:bg-white/80 text-slate-500">or continue with</span>
                    </div>
                  </div>
                  <CustomGoogleButton
                    mode="signin"
                    isLoading={isGoogleLoading}
                    onSuccess={(isNewUser) => console.log('Google signin:', isNewUser)}
                    onError={(error) => { setError(error); setIsGoogleLoading(false); }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 lg:border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:shadow-md transition-all"
                  />
                </div>
                
                {/* Sign up link */}
                <p className="mt-4 lg:mt-6 text-center text-sm text-slate-600">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500">Sign up</Link>
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;