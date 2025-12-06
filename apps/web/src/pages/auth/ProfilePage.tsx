import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  User, 
  Mail, 
  Building2, 
  Loader2, 
  Save, 
  LogOut, 
  Calendar, 
  Edit3, 
  Camera,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { useToast } from '../../components/ui/Toast';

const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  business_name: z.string().optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfilePage() {
  const { user, isLoading, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || '',
      business_name: user?.business_name || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        business_name: user.business_name || '',
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setError(null);
    try {
      await updateProfile({
        full_name: data.full_name,
        business_name: data.business_name || null,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      const message = err?.response?.data?.detail || err?.message || 'Failed to update profile.';
      setError(message);
    }
  };

  const handleCancel = () => {
    reset({
      full_name: user?.full_name || '',
      business_name: user?.business_name || '',
    });
    setIsEditing(false);
    setError(null);
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Profile</h1>
          <p className="mt-2 text-slate-500">Manage your personal details and workspace settings.</p>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden relative">
        
        {/* Gradient Cover */}
        <div className="h-48 relative overflow-hidden bg-slate-900 z-0">
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[200%] rounded-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 blur-[80px] opacity-60" />
            <div className="absolute top-[20%] right-[10%] w-[50%] h-[150%] rounded-full bg-gradient-to-bl from-blue-600 via-sky-500 to-teal-400 blur-[80px] opacity-50" />
          </div>
          <div className="absolute inset-0 bg-grid-white/[0.05]" />
        </div>

        {/* Profile Content Container */}
        <div className="px-8 relative z-10">
          
          {/* 
            FIX: Removed 'items-end' and used 'mt-20' on the text container instead.
            This creates a reliable layout where text is pushed down explicitly 
            rather than relying on alignment that might float up.
          */}
          <div className="flex flex-col md:flex-row items-start -mt-16 mb-6 gap-6">
            
            {/* Avatar - Pulls up into the gradient */}
            <div className="relative group shrink-0 z-20">
              <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-2xl ring-1 ring-slate-900/5">
                <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-4xl font-bold shadow-inner relative overflow-hidden">
                  {getInitials(user?.full_name)}
                  <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
              </div>
            </div>

            {/* Name & Info Row - Pushed down explicitly */}
            <div className="flex-1 min-w-0 mt-4 md:mt-20 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                   <h2 className="text-3xl font-bold text-slate-900 truncate leading-tight">{user?.full_name}</h2>
                   <div className="flex items-center flex-wrap gap-6 mt-2 text-slate-500 font-medium">
                    <span className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {user?.email}
                    </span>
                    <span className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                    </span>
                   </div>
                </div>

                {!isEditing && (
                  <Button 
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    leftIcon={<Edit3 className="w-4 h-4" />}
                    className="shrink-0 bg-white shadow-sm border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Edit Details
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100 w-full my-8" />

          {/* Form Section */}
          <div className="max-w-3xl pb-10">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-slate-900">Personal Information</h3>
              <p className="text-slate-500 mt-1">Update your public profile details.</p>
            </div>

            {error && (
              <div className="mb-6">
                <Alert type="error">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm font-semibold text-slate-700 block">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                      <User className="w-5 h-5" />
                    </div>
                    <Input
                      id="full_name"
                      {...register('full_name')}
                      disabled={!isEditing || isSubmitting}
                      className={`pl-11 h-11 rounded-xl w-full ${
                        !isEditing 
                          ? 'bg-slate-50 border-slate-200 text-slate-700 font-medium' 
                          : 'bg-white border-slate-200 focus:ring-4 focus:ring-indigo-500/10'
                      }`}
                    />
                  </div>
                  {errors.full_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>
                  )}
                </div>

                {/* Business Name */}
                <div className="space-y-2">
                  <label htmlFor="business_name" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                    Business Name
                    <span className="text-slate-400 font-normal text-sm">(Optional)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <Input
                      id="business_name"
                      placeholder="e.g. Acme Design Studio"
                      {...register('business_name')}
                      disabled={!isEditing || isSubmitting}
                      className={`pl-11 h-11 rounded-xl w-full ${
                        !isEditing 
                          ? 'bg-slate-50 border-slate-200 text-slate-700 font-medium' 
                          : 'bg-white border-slate-200 focus:ring-4 focus:ring-indigo-500/10'
                      }`}
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-slate-700 block">
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 z-10">
                      <Mail className="w-5 h-5" />
                    </div>
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="pl-11 pr-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-slate-500 cursor-not-allowed w-full hover:bg-slate-100 transition-colors" 
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" title="Locked">
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    To change your email address, please contact support.
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center gap-4 pt-2">
                  <Button
                    type="submit"
                    className="shadow-lg shadow-indigo-500/20 px-6 h-11"
                    disabled={isSubmitting || !isDirty}
                    leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={handleCancel} 
                    disabled={isSubmitting}
                    className="text-slate-600 hover:text-slate-900 h-11 px-6"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Security Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Security & Login</h3>
              <p className="text-sm text-slate-500 mt-0.5">Manage your password</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="whitespace-nowrap" disabled>
            Change Password
          </Button>
        </div>

        {/* Session Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 shrink-0">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Session Management</h3>
              <p className="text-sm text-slate-500 mt-0.5">Active on this device</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={logout}
            className="whitespace-nowrap text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;