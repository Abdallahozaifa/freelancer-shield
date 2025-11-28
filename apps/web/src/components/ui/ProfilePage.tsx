import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Building2, Loader2, Save, LogOut, Shield } from 'lucide-react';
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

  // Reset form when user data changes
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
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to update profile. Please try again.';
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

  const handleLogout = () => {
    logout();
  };

  const isFormLoading = isLoading || isSubmitting;

  // Get user initials for avatar
  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 shadow-lg border-0 mb-6">
          {/* Avatar and Basic Info Header */}
          <div className="flex items-start justify-between mb-8 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-semibold flex items-center justify-center">
                {getInitials(user?.full_name)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.full_name || 'User'}
                </h2>
                <p className="text-gray-500 flex items-center gap-1.5 mt-1">
                  <Mail className="w-4 h-4" />
                  {user?.email}
                </p>
                {user?.business_name && (
                  <p className="text-gray-500 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-4 h-4" />
                    {user.business_name}
                  </p>
                )}
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="shrink-0"
              >
                Edit Profile
              </Button>
            )}
          </div>

          {error && (
            <Alert variant="error" className="mb-6">
              {error}
            </Alert>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 bg-gray-50 cursor-not-allowed"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Email address cannot be changed
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="full_name"
                  type="text"
                  disabled={!isEditing || isFormLoading}
                  {...register('full_name')}
                  className={`pl-10 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                  } ${errors.full_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
              </div>
              {errors.full_name && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.full_name.message}
                </p>
              )}
            </div>

            {/* Business Name */}
            <div>
              <label
                htmlFor="business_name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Business name <span className="text-gray-400">(optional)</span>
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="business_name"
                  type="text"
                  placeholder="Your Company LLC"
                  disabled={!isEditing || isFormLoading}
                  {...register('business_name')}
                  className={`pl-10 ${
                    !isEditing ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex items-center gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isFormLoading || !isDirty}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {isFormLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isFormLoading}
                >
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* Account Actions Card */}
        <Card className="p-6 shadow-lg border-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Account Actions
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Sign out</p>
                <p className="text-sm text-gray-500">
                  Sign out of your account on this device
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">Account created</p>
                <p className="text-sm text-gray-500">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
