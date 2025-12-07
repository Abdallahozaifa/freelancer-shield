import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Loader2, 
  Check, 
  ArrowRight,
  LayoutDashboard,
  PieChart,
  Settings,
  Bell,
  Search,
  Menu,
  Lock,
  CheckCircle2,
  Crown,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { useUpgrade } from '../../hooks/useBilling';

const registerSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    full_name: z.string().min(1, 'Full name is required'),
    business_name: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const passwordRequirements = [
  { label: '8+ characters', regex: /.{8,}/ },
  { label: 'Lowercase letter', regex: /[a-z]/ },
  { label: 'Uppercase letter', regex: /[A-Z]/ },
  { label: 'Number', regex: /[0-9]/ },
];

function getErrorMessage(err: any): string {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map((e: any) => e.msg || e.message || String(e)).join(', ');
  if (detail && typeof detail === 'object') return detail.msg || detail.message || JSON.stringify(detail);
  return err?.message || 'Registration failed. Please try again.';
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan'); // 'pro' or null
  const setAuth = useAuthStore((state) => state.setAuth);
  const { upgrade } = useUpgrade();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
      business_name: '',
    },
  });

  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    
    try {
      await authApi.register({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        business_name: data.business_name || undefined,
      });
      
      const tokenResponse = await authApi.login({
        email: data.email,
        password: data.password,
      });
      
      useAuthStore.setState({ token: tokenResponse.access_token });
      const userData = await authApi.getMe();
      setAuth(userData, tokenResponse.access_token);
      
      // If user came from pricing page with pro plan intent
      if (planParam === 'pro') {
        // Redirect to Stripe checkout after successful signup
        upgrade();
      } else {
        // Normal signup flow - go to dashboard
        navigate('/dashboard');
      }
    } catch (err: any) {
      const message = getErrorMessage(err);
      if (message.toLowerCase().includes('email') && 
          (message.toLowerCase().includes('exists') || message.toLowerCase().includes('already'))) {
        setError('An account with this email already exists. Please sign in instead.');
      } else {
        setError(message);
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      
      {/* --- Left Panel: Dashboard Visual & Brand --- */}
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
                    <p className="text-xs text-indigo-200 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">$24,500</p>
                    <div className="mt-2 h-1 w-full bg-indigo-900/50 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-indigo-400 rounded-full" />
                    </div>
                  </div>
                  <div className="w-1/3 p-4 rounded-xl bg-white/5 border border-white/5">
                    <p className="text-xs text-slate-400 mb-1">Proposals</p>
                    <p className="text-2xl font-bold text-white">12</p>
                  </div>
                </div>

                {/* Scope Alert Card */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-amber-500/20 rounded text-amber-400">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-amber-200">Scope Creep Detected</span>
                  </div>
                  <div className="h-2 w-full bg-amber-900/30 rounded-full overflow-hidden">
                    <div className="h-full w-1/2 bg-amber-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Badge */}
          <div className="absolute -bottom-6 -left-6 bg-white text-slate-900 p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce-slow">
            <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Protection Active</p>
              <p className="text-sm font-bold">ScopeGuard Enabled</p>
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
            Join thousands of freelancers protecting their work and time.
          </p>
        </div>
      </div>

      {/* --- Right Panel: Registration Form --- */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-24 bg-white overflow-y-auto py-10">
        <div className="w-full max-w-md mx-auto space-y-8">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">ScopeGuard</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-slate-500">
              Start managing your project scope effectively.
            </p>
          </div>

          {/* Show Pro plan indicator if coming from pricing */}
          {planParam === 'pro' && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg animate-fade-in">
              <div className="flex items-center gap-2 text-indigo-900 mb-1">
                <Crown className="w-5 h-5 text-indigo-600" />
                <span className="font-medium">You're signing up for the Pro plan</span>
              </div>
              <p className="text-sm text-indigo-700">
                After creating your account, you'll be redirected to complete your subscription.
              </p>
            </div>
          )}

          {error && (
            <Alert type="error" className="animate-fade-in">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="block text-sm font-semibold text-slate-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Jane Smith"
                disabled={isSubmitting}
                {...register('full_name')}
                className={`h-11 ${errors.full_name ? 'border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.full_name && (
                <p className="text-sm text-red-600">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Work Email <span className="text-red-500">*</span>
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
              <label htmlFor="business_name" className="block text-sm font-semibold text-slate-700">
                Business Name <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <Input
                id="business_name"
                type="text"
                autoComplete="organization"
                placeholder="e.g. Acme Design Studio"
                disabled={isSubmitting}
                {...register('business_name')}
                className="h-11"
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
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
              </div>

              {/* Password Strength Indicators */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                {passwordRequirements.map((req) => {
                  const isMet = req.regex.test(password);
                  return (
                    <div
                      key={req.label}
                      className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                        isMet ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isMet ? 'bg-emerald-100 border-emerald-200' : 'bg-white border-slate-200'
                      }`}>
                        <Check className={`w-2.5 h-2.5 ${isMet ? 'opacity-100' : 'opacity-0'}`} />
                      </div>
                      {req.label}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                    {...register('confirmPassword')}
                    className={`h-11 pr-11 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-base shadow-lg shadow-indigo-500/20 mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
             <div className="flex items-center gap-1">
               <Lock className="w-3 h-3" />
               Secure Encryption
             </div>
             <span>•</span>
             <Link to="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
             <span>•</span>
             <Link to="/terms" className="hover:text-slate-600">Terms of Service</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;