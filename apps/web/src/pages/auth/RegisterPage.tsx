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
    <div className="min-h-screen">
      
      {/* ============================================ */}
      {/* MOBILE LAYOUT - Only visible below lg */}
      {/* ============================================ */}
      <div className="lg:hidden min-h-screen flex flex-col bg-white">
        
        {/* Top Section - Gradient - SMALLER for signup */}
        <div className="relative h-[20vh] min-h-[140px] max-h-[160px] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 overflow-visible">
          
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
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
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
        
        {/* Form Section - Seamless connection */}
        <div className="flex-1 bg-white px-5 pt-4 relative overflow-y-auto -mt-2">
          
          {/* Header */}
          <div className="mb-4 pr-12">
            <h1 className="text-xl font-bold text-slate-900 mb-0.5">
              Create Account
            </h1>
            <p className="text-slate-500 text-xs">
              Start managing your project scope
            </p>
          </div>
          
          {/* Form - Very tight spacing */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
            {error && (
              <Alert type="error" className="animate-fade-in mb-2">
                {error}
              </Alert>
            )}

            {/* Show Pro plan indicator if coming from pricing */}
            {planParam === 'pro' && (
              <div className="mb-2 p-2 bg-indigo-50 border border-indigo-200 rounded-lg animate-fade-in">
                <div className="flex items-center gap-1.5 text-indigo-900 mb-0.5">
                  <Crown className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-medium text-xs">Pro plan signup</span>
                </div>
                <p className="text-[10px] text-indigo-700">
                  Redirected to checkout after signup
                </p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="full_name" className="text-sm font-medium text-slate-700">Full Name</label>
                {errors.full_name && (
                  <span className="text-xs text-red-500 font-medium">{errors.full_name.message}</span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                <Input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Full Name"
                  disabled={isSubmitting}
                  {...register('full_name')}
                  className={`pl-10 pr-4 py-2.5 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${errors.full_name ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-indigo-100 bg-indigo-50/50 focus:bg-white'}`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">Email</label>
                {errors.email && (
                  <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>
                )}
              </div>
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
                  className={`pl-10 pr-4 py-2.5 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${errors.email ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-indigo-100 bg-indigo-50/50 focus:bg-white'}`}
                />
              </div>
            </div>

            {/* Business Name (Optional) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="business_name" className="text-sm font-medium text-slate-700">Business Name <span className="text-slate-400 font-normal">(Optional)</span></label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="w-4 h-4 text-slate-400" />
                </div>
                <Input
                  id="business_name"
                  type="text"
                  autoComplete="organization"
                  placeholder="Business Name (Optional)"
                  disabled={isSubmitting}
                  {...register('business_name')}
                  className="pl-10 pr-4 py-2.5 border border-indigo-100 bg-indigo-50/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                {errors.password && (
                  <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Password"
                  disabled={isSubmitting}
                  {...register('password')}
                  className={`pl-10 pr-10 py-2.5 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${errors.password ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-indigo-100 bg-indigo-50/50 focus:bg-white'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
              {/* Password Requirements - Inline, compact */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 px-1 mt-1">
                {passwordRequirements.map((req) => {
                  const isMet = req.regex.test(password);
                  return (
                    <div
                      key={req.label}
                      className={`flex items-center gap-1 text-[10px] ${isMet ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center shrink-0 ${isMet ? 'bg-emerald-500' : 'border border-slate-300'}`}>
                        {isMet && <Check className="w-1.5 h-1.5 text-white" />}
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
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</label>
                {errors.confirmPassword && (
                  <span className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Confirm Password"
                  disabled={isSubmitting}
                  {...register('confirmPassword')}
                  className={`pl-10 pr-10 py-2.5 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${errors.confirmPassword ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-indigo-100 bg-indigo-50/50 focus:bg-white'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4 text-slate-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 transition-all mt-1 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Social Signup - Mobile */}
          <div className="mt-5 px-6">
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-slate-400">Or sign up with</span>
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
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium active:bg-slate-100 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Sign In Link */}
          <p className="mt-3 mb-3 text-center text-slate-600 text-xs">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600">Sign in</Link>
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* DESKTOP LAYOUT - Only visible at lg and above */}
      {/* ============================================ */}
      <div className="hidden lg:flex min-h-screen bg-white">
      
      {/* --- Left Panel: Dashboard Visual & Brand --- */}
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
      <div className="hidden lg:flex w-1/2 items-center justify-center relative overflow-y-auto">
        {/* Professional gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
        
        {/* Soft decorative orbs */}
        <div className="absolute top-16 right-16 w-72 h-72 bg-indigo-100/30 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-16 left-12 w-64 h-64 bg-purple-100/30 rounded-full filter blur-3xl pointer-events-none" />
        
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent" />
        
        {/* Centered form container */}
        <div className="relative w-full max-w-lg mx-auto px-6 py-4 my-auto">
          
          {/* Desktop Logo - Centered above form */}
          <div className="flex justify-center mb-3">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Shield className="w-5 h-5 text-white" />
            </div>
              <span className="font-bold text-xl text-slate-900">ScopeGuard</span>
            </Link>
          </div>

          {/* Form Card - Enhanced styling with better definition */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-5">
            {/* Desktop Header - Centered inside card */}
            <div className="text-center mb-3">
              <h1 className="text-xl font-bold text-slate-900 mb-1 tracking-tight">Create your account</h1>
              <p className="text-slate-500 text-sm">
                Start managing your project scope effectively
            </p>
          </div>

            {/* Show Pro plan indicator if coming from pricing */}
            {planParam === 'pro' && (
              <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg animate-fade-in">
                <div className="flex items-center gap-2 text-indigo-900 mb-1">
                  <Crown className="w-4 h-4 text-indigo-600" />
                  <span className="font-medium text-sm">You're signing up for the Pro plan</span>
                </div>
                <p className="text-xs text-indigo-700">
                  After creating your account, you'll be redirected to complete your subscription.
                </p>
              </div>
            )}

          {error && (
              <Alert type="error" className="animate-fade-in mb-4">
              {error}
            </Alert>
          )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="full_name" className="text-sm font-medium text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                {errors.full_name && (
                  <span className="text-xs text-red-500 font-medium">{errors.full_name.message}</span>
                )}
              </div>
              <div className="relative">
                {/* Icon - Desktop only */}
                <div className="hidden lg:flex absolute inset-y-0 left-0 pl-3.5 items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
              <Input
                id="full_name"
                type="text"
                autoComplete="name"
                placeholder="e.g. Jane Smith"
                disabled={isSubmitting}
                {...register('full_name')}
                  className={`lg:pl-11 px-4 py-2 h-10 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${errors.full_name ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500'}`}
              />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Work Email <span className="text-red-500">*</span>
                </label>
                {errors.email && (
                  <span className="text-xs text-red-500 font-medium">{errors.email.message}</span>
                )}
              </div>
              <div className="relative">
                {/* Icon - Desktop only */}
                <div className="hidden lg:flex absolute inset-y-0 left-0 pl-3.5 items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                disabled={isSubmitting}
                {...register('email')}
                  className={`lg:pl-11 px-4 py-2 h-10 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${errors.email ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500'}`}
              />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="business_name" className="text-sm font-medium text-slate-700">
                  Business Name <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
              </div>
              <div className="relative">
                {/* Icon - Desktop only */}
                <div className="hidden lg:flex absolute inset-y-0 left-0 pl-3.5 items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-slate-400" />
                </div>
              <Input
                id="business_name"
                type="text"
                autoComplete="organization"
                placeholder="e.g. Acme Design Studio"
                disabled={isSubmitting}
                {...register('business_name')}
                  className="lg:pl-11 px-4 py-2 h-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="text-sm font-medium text-slate-700">
                  Password <span className="text-red-500">*</span>
                </label>
                {errors.password && (
                  <span className="text-xs text-red-500 font-medium">{errors.password.message}</span>
                )}
              </div>
                <div className="relative">
                {/* Icon - Desktop only */}
                <div className="hidden lg:flex absolute inset-y-0 left-0 pl-3.5 items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    disabled={isSubmitting}
                    {...register('password')}
                  className={`lg:pl-11 px-4 pr-12 py-2 h-10 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${errors.password ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

              {/* Password Strength Indicators - Always visible */}
              <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-0.5">
                {passwordRequirements.map((req) => {
                  const isMet = req.regex.test(password);
                  return (
                    <div
                      key={req.label}
                      className={`flex items-center gap-1.5 text-xs transition-colors ${
                        isMet ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                        isMet ? 'bg-emerald-500' : 'border border-slate-300'
                      }`}>
                        {isMet && <Check className="w-2 h-2 text-white" />}
                      </div>
                      {req.label}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                {errors.confirmPassword && (
                  <span className="text-xs text-red-500 font-medium">{errors.confirmPassword.message}</span>
                )}
              </div>
                <div className="relative">
                {/* Icon - Desktop only */}
                <div className="hidden lg:flex absolute inset-y-0 left-0 pl-3.5 items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    disabled={isSubmitting}
                    {...register('confirmPassword')}
                  className={`lg:pl-11 px-4 pr-12 py-2 h-10 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${errors.confirmPassword ? 'border-red-500 bg-red-50/50 focus:ring-red-500' : 'border-slate-200 bg-slate-50 focus:bg-white focus:ring-indigo-500'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
                className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all duration-200 mt-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Get Started
                    <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

            {/* Social Signup Options - Desktop only */}
            <div className="mt-3">
              <div className="relative mb-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/80 backdrop-blur-sm text-slate-500">or sign up with</span>
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
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-700 font-medium hover:bg-slate-50 hover:border-slate-400 hover:shadow-md transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
              />
            </div>

            {/* Sign In Link - Inside card */}
            <div className="pt-2 border-t border-slate-100 text-center mt-2">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link 
                to="/login" 
                  className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Sign in
              </Link>
            </p>
            </div>
          </div>

          {/* Security Badges - Centered below card */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-3 pb-2 px-4">
            <span className="flex items-center gap-1">
               <Lock className="w-3 h-3" />
               Secure Encryption
            </span>
            <span className="hidden sm:inline">•</span>
            <Link to="/privacy" className="hover:text-slate-300 lg:hover:text-slate-600 transition-colors">Privacy Policy</Link>
            <span className="hidden sm:inline">•</span>
            <Link to="/terms" className="hover:text-slate-300 lg:hover:text-slate-600 transition-colors">Terms of Service</Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;