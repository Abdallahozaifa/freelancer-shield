import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Mail,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { authApi } from '../../api/auth';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.forgotPassword(data.email);
      setIsSuccess(true);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Something went wrong. Please try again.'
      );
    } finally {
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
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 z-0" />
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />

          <div className="relative z-10 text-center max-w-md">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Mail className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Password Recovery</h2>
            <p className="text-slate-400 text-lg">
              Don't worry, it happens to the best of us. Enter your email and
              we'll send you instructions to reset your password.
            </p>
          </div>

          <div className="absolute bottom-12 left-12 z-20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-6 h-6 text-indigo-400" />
              <span className="font-bold text-xl tracking-tight">
                ScopeGuard
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-xs">
              Secure password recovery for your account.
            </p>
          </div>
        </div>

        {/* ============================================ */}
        {/* RIGHT SIDE - Mobile header + Shared form */}
        {/* ============================================ */}
        <div className="flex-1 flex flex-col bg-white">
          
          {/* MOBILE HEADER - Only visible below lg */}
          <div className="lg:hidden relative h-[25vh] min-h-[180px] max-h-[200px] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 overflow-visible">
            
            {/* Navigation Row */}
            <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10">
              <Link
                to="/login"
                className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
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
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Curved bottom edge */}
            <div className="absolute -bottom-px left-0 right-0">
              <svg
                viewBox="0 0 1440 80"
                className="w-full h-[50px] fill-white block"
                preserveAspectRatio="none"
              >
                <path d="M0,40 C360,90 720,0 1080,60 C1260,80 1380,40 1440,40 L1440,80 L0,80 Z" />
              </svg>
            </div>

            {/* Floating icon */}
            <div className="absolute bottom-0 right-8 translate-y-1/2 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-xl shadow-indigo-500/30 rotate-12 z-20">
              <Mail className="w-6 h-6 text-white -rotate-12" />
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
                <h1 className="text-2xl font-bold text-slate-900 mb-0.5">Reset Password</h1>
                <p className="text-slate-500 text-sm">Enter your email to receive a reset link</p>
              </div>
              
              {/* Form card - styled differently per breakpoint */}
              <div className="lg:bg-white/80 lg:backdrop-blur-sm lg:rounded-2xl lg:shadow-xl lg:shadow-slate-200/50 lg:border lg:border-slate-200/50 lg:p-6">
                
                {/* Desktop header - only on lg+ */}
                <div className="hidden lg:block text-center mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 mb-1">Forgot Password?</h1>
                  <p className="text-slate-500">Enter your email and we'll send you a reset link</p>
                </div>
                
                {/* Success state */}
                {isSuccess ? (
                  <div className="text-center py-4 lg:py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-semibold text-slate-900 mb-2">
                      Check your email
                    </h3>
                    <p className="text-slate-500 text-sm lg:text-base mb-6">
                      If an account exists with that email, we've sent password reset
                      instructions.
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-indigo-600 font-medium text-sm lg:text-base hover:text-indigo-500 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to login
                    </Link>
                  </div>
                ) : (
                  <>
                    {error && (
                      <Alert type="error" className="animate-fade-in mb-4">{error}</Alert>
                    )}
                    
                    {/* SINGLE FORM - ONE email input */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    
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
                    
                    {/* Submit */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending...</>
                      ) : (
                        <>Send Reset Link<ArrowRight className="w-5 h-5 ml-2" /></>
                      )}
                    </Button>
                  </form>
                  
                  {/* Back to login link */}
                  <p className="mt-4 lg:mt-6 text-center text-sm text-slate-600">
                    Remember your password?{' '}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500">Back to login</Link>
                  </p>
                </>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
