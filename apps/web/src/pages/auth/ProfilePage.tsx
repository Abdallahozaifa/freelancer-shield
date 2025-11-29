import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Building2, Loader2, Save, LogOut, Calendar, Edit3, X } from 'lucide-react';
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
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account information and preferences</p>
      </div>

      {/* Profile Card */}
      <Card className="p-0 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-10">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm text-white text-3xl font-bold flex items-center justify-center shadow-lg">
              {getInitials(user?.full_name)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.full_name || 'User'}</h2>
              <p className="text-indigo-100 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" />
                {user?.email}
              </p>
              {user?.business_name && (
                <p className="text-indigo-100 flex items-center gap-2 mt-1">
                  <Building2 className="w-4 h-4" />
                  {user.business_name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Account Information</h3>
            {!isEditing && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
                leftIcon={<Edit3 className="w-4 h-4" />}
              >
                Edit Profile
              </Button>
            )}
          </div>

          {error && (
            <div className="mb-6">
              <Alert type="error">{error}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <Input 
                    type="email" 
                    value={user?.email || ''} 
                    disabled 
                    className="pl-11 bg-slate-50 cursor-not-allowed" 
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">Email cannot be changed</p>
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-slate-700 mb-2">
                  Full name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <Input
                    id="full_name"
                    type="text"
                    disabled={!isEditing || isSubmitting}
                    {...register('full_name')}
                    className={`pl-11 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''} ${
                      errors.full_name ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                {errors.full_name && (
                  <p className="mt-1.5 text-sm text-red-600">{errors.full_name.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="business_name" className="block text-sm font-medium text-slate-700 mb-2">
                  Business name <span className="text-slate-400">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Building2 className="w-5 h-5 text-slate-400" />
                  </div>
                  <Input
                    id="business_name"
                    type="text"
                    placeholder="Your Company LLC"
                    disabled={!isEditing || isSubmitting}
                    {...register('business_name')}
                    className={`pl-11 ${!isEditing ? 'bg-slate-50 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleCancel} 
                  disabled={isSubmitting}
                  leftIcon={<X className="w-4 h-4" />}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </div>
      </Card>

      {/* Account Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Account</h3>
        
        <div className="space-y-4">
          {/* Account Created */}
          <div className="flex items-center justify-between py-4 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Account created</p>
                <p className="text-sm text-slate-500">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Sign Out */}
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-slate-900">Sign out</p>
                <p className="text-sm text-slate-500">Sign out of your account on this device</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={logout}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              Sign out
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProfilePage;
