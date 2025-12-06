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
  LayoutDashboard,
  PieChart,
  Settings,
  Bell,
  Search,
  Menu,
  Lock
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
    <div className="min-h-screen flex bg-white">
      
      {/* --- Left Panel: Dashboard Preview & Brand --- */}
      <div className="hidden lg:flex lg:w-[50%] bg-slate-900 relative overflow-hidden flex-col justify-center p-12 text-white">
        
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 z-0" />
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />

        {/* Dashboard Mockup Container */}
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

      {/* --- Right Panel: Login Form --- */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-24 bg-white relative">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">ScopeGuard</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-slate-500">
              Enter your credentials to access your workspace.
            </p>
          </div>

          {error && (
            <Alert type="error" className="animate-fade-in">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@company.com"
                  disabled={isSubmitting}
                  {...register('email')}
                  className={`h-11 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline tabindex-[-1]"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    disabled={isSubmitting}
                    {...register('password')}
                    className={`h-11 pr-11 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                {...register('rememberMe')}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-base shadow-lg shadow-indigo-500/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Start for free
              </Link>
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
             <div className="flex items-center gap-1">
               <Lock className="w-3 h-3" />
               Secure SSL
             </div>
             <span>•</span>
             <Link to="/privacy" className="hover:text-slate-600">Privacy</Link>
             <span>•</span>
             <Link to="/terms" className="hover:text-slate-600">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;