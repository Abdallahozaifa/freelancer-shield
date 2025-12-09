import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Shield,
  Loader2, 
  Check, 
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  PieChart,
  Settings,
  Bell,
  Search,
  Menu,
  Lock,
  CheckCircle2,
  Crown,
  Mail,
  User,
  Building2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { authApi } from '../../api/auth';
import { useAuthStore } from '../../stores/authStore';
import { useUpgrade } from '../../hooks/useBilling';
import { CustomGoogleButton } from '../../components/auth/CustomGoogleButton';

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
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
    <div className="min-h-screen bg-white overflow-x-hidden overscroll-none">
      <div className="min-h-screen lg:flex">
        
        {/* LEFT PANEL - Desktop only (keep existing) */}
        <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-12 text-white">
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

        {/* RIGHT SIDE - Contains mobile header + shared form */}
        <div className="flex-1 flex flex-col">
          
          {/* MOBILE HEADER - Mobile only (keep existing) */}
          <div className="lg:hidden relative h-[20vh] min-h-[140px] max-h-[160px] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 overflow-visible">
            
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
            
            {/* Decorative orbs - Positioned safely */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-16 left-8 w-20 h-20 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />
            
            {/* Grid pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
            
            {/* Curved bottom edge - Overlapping to prevent line */}
            <div className="absolute -bottom-px left-0 right-0">
              <svg viewBox="0 0 1440 70" className="w-full h-[50px] fill-white block" preserveAspectRatio="none">
                <path d="M0,35 C360,80 720,0 1080,50 C1260,70 1380,30 1440,35 L1440,70 L0,70 Z" />
              </svg>
            </div>
            
            {/* Floating icon at curve - SAFE POSITION */}
            <div className="absolute bottom-0 right-8 translate-y-1/2 w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/30 rotate-12 z-20">
              <Shield className="w-5 h-5 text-white -rotate-12" />
            </div>
          </div>
          
          {/* FORM CONTAINER - Visible on ALL screen sizes */}
          <div className="flex-1 flex items-start lg:items-center justify-center px-5 lg:px-8 py-4 lg:py-12 -mt-2 lg:mt-0">
            <div className="w-full max-w-sm lg:max-w-lg">
              
              {/* Desktop logo - only on desktop */}
              <div className="hidden lg:flex justify-center mb-3">
                <Link to="/" className="inline-flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-xl text-slate-900">ScopeGuard</span>
                </Link>
              </div>
              
              {/* Form card - different styling per breakpoint */}
              <div className="lg:bg-white/80 lg:backdrop-blur-sm lg:rounded-2xl lg:shadow-xl lg:border lg:border-slate-200/50 lg:p-5">
                
                {/* Header */}
                <div className="mb-4 lg:text-center pr-12 lg:pr-0">
                  <h1 className="text-xl lg:text-xl font-bold text-slate-900">Create Account</h1>
                  <p className="text-slate-500 text-xs lg:text-sm">Start managing your project scope</p>
                </div>
                
                {/* THE SINGLE FORM */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
                  {error && (
                    <Alert type="error" className="animate-fade-in mb-2">
                      {error}
                    </Alert>
                  )}

                  {/* Show Pro plan indicator if coming from pricing */}
                  {planParam === 'pro' && (
                    <div className="mb-2 lg:mb-4 p-2 lg:p-3 bg-indigo-50 border border-indigo-200 rounded-lg animate-fade-in">
                      <div className="flex items-center gap-1.5 lg:gap-2 text-indigo-900 mb-0.5 lg:mb-1">
                        <Crown className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-indigo-600" />
                        <span className="font-medium text-xs lg:text-sm">Pro plan signup</span>
                      </div>
                      <p className="text-[10px] lg:text-xs text-indigo-700">
                        Redirected to checkout after signup
                      </p>
                    </div>
                  )}

                  {/* Full Name */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="full_name" className="text-sm font-medium text-slate-700">
                        Full Name <span className="hidden lg:inline text-red-500">*</span>
                      </label>
                      {errors.full_name && (
                        <span className="text-xs text-red-500 font-medium">{errors.full_name.message}</span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 lg:pl-3.5 flex items-center pointer-events-none z-0">
                        <User className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                      </div>
                      <input
                        id="full_name"
                        type="text"
                        autoComplete="name"
                        placeholder="Full Name"
                        disabled={isSubmitting}
                        {...register('full_name')}
                        className={`w-full pl-10 lg:pl-11 pr-4 py-3 lg:py-2 h-auto lg:h-10 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm min-h-[44px] lg:min-h-0 ${
                          errors.full_name 
                            ? 'border-red-500 bg-red-50/50 focus:ring-red-500' 
                            : 'border-indigo-100 lg:border-slate-200 bg-indigo-50/50 lg:bg-slate-50 focus:bg-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="email" className="text-sm font-medium text-slate-700">
                        Email <span className="hidden lg:inline text-red-500">*</span>
                      </label>
                      {errors.email && (
                        <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 lg:pl-3.5 flex items-center pointer-events-none z-0">
                        <Mail className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                      </div>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Email address"
                        disabled={isSubmitting}
                        {...register('email')}
                        className={`w-full pl-10 lg:pl-11 pr-4 py-3 lg:py-2 h-auto lg:h-10 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm min-h-[44px] lg:min-h-0 ${
                          errors.email 
                            ? 'border-red-500 bg-red-50/50 focus:ring-red-500' 
                            : 'border-indigo-100 lg:border-slate-200 bg-indigo-50/50 lg:bg-slate-50 focus:bg-white'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Business Name (Optional) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="business_name" className="text-sm font-medium text-slate-700">
                        Business Name <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 lg:pl-3.5 flex items-center pointer-events-none z-0">
                        <Building2 className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                      </div>
                      <input
                        id="business_name"
                        type="text"
                        autoComplete="organization"
                        placeholder="Business Name (Optional)"
                        disabled={isSubmitting}
                        {...register('business_name')}
                        className="w-full pl-10 lg:pl-11 pr-4 py-3 lg:py-2 h-auto lg:h-10 border border-indigo-100 lg:border-slate-200 bg-indigo-50/50 lg:bg-slate-50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-sm min-h-[44px] lg:min-h-0"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="password" className="text-sm font-medium text-slate-700">
                        Password <span className="hidden lg:inline text-red-500">*</span>
                      </label>
                      {errors.password && (
                        <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 lg:pl-3.5 flex items-center pointer-events-none z-0">
                        <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Password"
                        disabled={isSubmitting}
                        {...register('password')}
                        className={`w-full pl-10 lg:pl-11 pr-12 py-3 lg:py-2 h-auto lg:h-10 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm min-h-[44px] lg:min-h-0 ${
                          errors.password 
                            ? 'border-red-500 bg-red-50/50 focus:ring-red-500' 
                            : 'border-indigo-100 lg:border-slate-200 bg-indigo-50/50 lg:bg-slate-50 focus:bg-white'
                        }`}
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
                    
                    {/* Password requirements */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-1 mt-1">
                      {passwordRequirements.map((req) => {
                        const isMet = req.regex.test(password);
                        return (
                          <div
                            key={req.label}
                            className={`flex items-center gap-1 lg:gap-1.5 text-[10px] lg:text-xs ${isMet ? 'text-emerald-600' : 'text-slate-400'}`}
                          >
                            <div className={`w-3 lg:w-3.5 h-3 lg:h-3.5 rounded-full flex items-center justify-center shrink-0 ${isMet ? 'bg-emerald-500' : 'border border-slate-300'}`}>
                              {isMet && <Check className="w-1.5 lg:w-2 h-1.5 lg:h-2 text-white" />}
                            </div>
                            {req.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                        Confirm Password <span className="hidden lg:inline text-red-500">*</span>
                      </label>
                      {errors.confirmPassword && (
                        <span className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 lg:pl-3.5 flex items-center pointer-events-none z-0">
                        <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Confirm Password"
                        disabled={isSubmitting}
                        {...register('confirmPassword')}
                        className={`w-full pl-10 lg:pl-11 pr-12 py-3 lg:py-2 h-auto lg:h-10 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm min-h-[44px] lg:min-h-0 ${
                          errors.confirmPassword 
                            ? 'border-red-500 bg-red-50/50 focus:ring-red-500' 
                            : 'border-indigo-100 lg:border-slate-200 bg-indigo-50/50 lg:bg-slate-50 focus:bg-white'
                        }`}
                        style={{ color: '#0f172a', WebkitTextFillColor: '#0f172a' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute top-1/2 -translate-y-1/2 right-3 p-1 text-slate-400 hover:text-slate-600"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" /> : <Eye className="w-4 h-4 lg:w-5 lg:h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 lg:h-12 lg:text-base bg-gradient-to-r from-slate-800 lg:from-indigo-600 to-slate-900 lg:to-purple-600 hover:from-slate-700 lg:hover:from-indigo-700 hover:to-slate-800 lg:hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 lg:shadow-indigo-500/30 transition-all mt-1 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <span className="lg:hidden">Create Account</span>
                        <span className="hidden lg:inline">Get Started</span>
                        <ArrowRight className="hidden lg:block w-5 h-5 ml-2" />
                      </>
                    )}
                  </button>
                </form>

                {/* Social Signup */}
                <div className="mt-5 lg:mt-3">
                  <div className="relative mb-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 bg-white lg:bg-white/80 backdrop-blur-sm text-xs lg:text-sm text-slate-400 lg:text-slate-500">or sign up with</span>
                    </div>
                  </div>

                  <CustomGoogleButton
                    mode="signup"
                    isLoading={isGoogleLoading}
                    onSuccess={(isNewUser) => {
                      console.log('User signed up via Google, isNewUser:', isNewUser);
                    }}
                    onError={(error) => {
                      setError(error);
                      setIsGoogleLoading(false);
                    }}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 lg:py-2.5 bg-white border border-slate-200 lg:border-slate-300 rounded-xl text-slate-700 font-medium active:bg-slate-100 lg:hover:bg-slate-50 lg:hover:border-slate-400 lg:hover:shadow-md transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Sign In Link */}
                <div className="mt-3 lg:pt-2 lg:border-t lg:border-slate-100 text-center">
                  <p className="text-xs lg:text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">Sign in</Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
