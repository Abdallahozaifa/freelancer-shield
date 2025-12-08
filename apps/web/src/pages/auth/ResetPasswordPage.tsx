import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
  Lock,
  Shield,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Alert } from '../../components/ui/Alert';
import { authApi } from '../../api/auth';

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/\d/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsVerifying(false);
        setIsValidToken(false);
        return;
      }

      try {
        const result = await authApi.verifyResetToken(token);
        setIsValidToken(result.valid);
        if (result.email) {
          setMaskedEmail(result.email);
        }
      } catch {
        setIsValidToken(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (isSubmitting || !token) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await authApi.resetPassword(token, data.password);
      setIsSuccess(true);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        typeof detail === 'string'
          ? detail
          : 'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    if (isVerifying) {
      return (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-500">Verifying your reset link...</p>
        </div>
      );
    }

    if (!token || !isValidToken) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Invalid or Expired Link
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Request New Link
          </Link>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Password Reset Complete
          </h3>
          <p className="text-slate-500 text-sm mb-6">
            Your password has been successfully reset. You can now log in with
            your new password.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="mb-4 pr-12 lg:pr-0 lg:text-center lg:mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-0.5 lg:mb-1 lg:tracking-tight">
            Reset Password
          </h1>
          <p className="text-slate-500 text-sm lg:text-base">
            {maskedEmail
              ? `Create a new password for ${maskedEmail}`
              : 'Create a new password for your account'}
          </p>
        </div>

        {error && (
          <Alert type="error" className="animate-fade-in mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1 lg:mb-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-slate-700"
              >
                New Password
              </label>
              {errors.password && (
                <span className="text-xs text-red-500 font-medium">
                  {errors.password.message}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 lg:pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Enter new password"
                disabled={isSubmitting}
                {...register('password')}
                className={`pl-10 lg:pl-11 pr-10 lg:pr-12 py-3 lg:h-12 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${
                  errors.password
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-500'
                    : 'border-indigo-100 lg:border-slate-200 bg-indigo-50/50 lg:bg-slate-50 focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 lg:pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" />
                ) : (
                  <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1 lg:mb-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-slate-700"
              >
                Confirm Password
              </label>
              {errors.confirmPassword && (
                <span className="text-xs text-red-500 font-medium">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 lg:pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />
              </div>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Confirm new password"
                disabled={isSubmitting}
                {...register('confirmPassword')}
                className={`pl-10 lg:pl-11 pr-10 lg:pr-12 py-3 lg:h-12 border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm ${
                  errors.confirmPassword
                    ? 'border-red-500 bg-red-50/50 focus:ring-red-500'
                    : 'border-indigo-100 lg:border-slate-200 bg-indigo-50/50 lg:bg-slate-50 focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 lg:pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 lg:w-5 lg:h-5" />
                ) : (
                  <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Password requirements hint */}
          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
            <p className="font-medium mb-1">Password must contain:</p>
            <ul className="space-y-0.5 ml-3 list-disc">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 lg:h-12 lg:text-base bg-gradient-to-r from-slate-800 to-slate-900 lg:from-indigo-600 lg:to-purple-600 hover:from-slate-700 hover:to-slate-800 lg:hover:from-indigo-700 lg:hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-slate-900/20 lg:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 lg:w-5 lg:h-5 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>

          <p className="text-center text-slate-600 text-sm">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-indigo-600">
              Back to login
            </Link>
          </p>
        </form>
      </>
    );
  };

  return (
    <div className="min-h-screen">
      {/* ============================================ */}
      {/* MOBILE LAYOUT - Only visible below lg */}
      {/* ============================================ */}
      <div className="lg:hidden min-h-screen flex flex-col bg-white">
        {/* Top Section - Gradient with curved bottom */}
        <div className="relative h-[25vh] min-h-[180px] max-h-[200px] bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 overflow-visible">
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
            <Lock className="w-6 h-6 text-white -rotate-12" />
          </div>
        </div>

        {/* Bottom Section - Form */}
        <div className="flex-1 bg-white px-5 pt-5 relative -mt-2">
          {renderContent()}
        </div>
      </div>

      {/* ============================================ */}
      {/* DESKTOP LAYOUT - Only visible at lg and above */}
      {/* ============================================ */}
      <div className="hidden lg:flex min-h-screen bg-white">
        {/* Left Panel - Decorative */}
        <div className="lg:w-[50%] bg-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-12 text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 z-0" />
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]" />

          <div className="relative z-10 text-center max-w-md">
            <div className="w-20 h-20 bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Lock className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Create New Password</h2>
            <p className="text-slate-400 text-lg">
              Choose a strong password to keep your account secure. Make sure
              it's at least 8 characters with a mix of letters and numbers.
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
              Secure your account with a strong password.
            </p>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30" />
          <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-100/30 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 left-16 w-64 h-64 bg-purple-100/30 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent" />

          <div className="w-full max-w-md mx-auto space-y-5 relative z-10">
            <div className="flex justify-center mb-6">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-slate-900">
                  ScopeGuard
                </span>
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200/50 p-6 sm:p-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
