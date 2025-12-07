import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Mail, AlignLeft, Crown } from 'lucide-react';
import { Modal, Button, Input, Textarea, useToast } from '../../components/ui';
import { useCreateClient, useUpdateClient } from '../../hooks/useClients';
import { useFeatureGate } from '../../hooks/useFeatureGate';
import { cn } from '../../utils/cn';
import type { Client } from '../../types';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().refine(
    (val) => !val || z.string().email().safeParse(val).success,
    { message: 'Invalid email format' }
  ).optional().or(z.literal('')),
  company: z.string().max(100, 'Company name is too long').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onSuccess?: () => void;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  client,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { canCreateClient, limits } = useFeatureGate();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const isEditing = !!client;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  
  // If creating (not editing) and at limit, show upgrade prompt instead of form
  const showUpgradePrompt = !isEditing && !canCreateClient;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      company: '',
      notes: '',
    },
  });

  const { ref: nameRef, ...nameRegister } = register('name');

  useEffect(() => {
    if (isOpen) {
      if (client) {
        reset({
          name: client.name,
          email: client.email || '',
          company: client.company || '',
          notes: client.notes || '',
        });
      } else {
        reset({
          name: '',
          email: '',
          company: '',
          notes: '',
        });
      }
      // Focus first input after modal animation
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, client, reset]);

  const onSubmit = async (data: ClientFormData) => {
    try {
      const payload = {
        name: data.name,
        email: data.email || null,
        company: data.company || null,
        notes: data.notes || null,
      };

      if (isEditing && client) {
        await updateMutation.mutateAsync({ id: client.id, data: payload });
        toast.success('Client updated successfully');
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Client added successfully');
      }

      // Reset form before closing
      reset({ name: '', email: '', company: '', notes: '' });
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        isEditing ? 'Failed to update client' : 'Failed to create client'
      );
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      // Reset form when closing
      reset({ name: '', email: '', company: '', notes: '' });
      onClose();
    }
  };

  // If creating (not editing) and at limit, show upgrade prompt instead of form
  if (showUpgradePrompt) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Client Limit Reached"
        size="md"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            Upgrade to Add More Clients
          </h3>
          <p className="text-slate-600 mb-6">
            You've reached the maximum of {limits.maxClients} clients on the Free plan.
            Upgrade to Pro for unlimited clients.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleClose}>
              Maybe Later
            </Button>
            <Button 
              onClick={() => {
                handleClose();
                navigate('/settings/billing');
              }}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro — $29/mo
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Client Details' : 'Add New Client'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        
        {/* --- Identity Section --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name Field */}
          <div className="space-y-1.5 relative">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              Client Name <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <Input
                {...nameRegister}
                ref={(e) => {
                  nameRef(e);
                  nameInputRef.current = e as HTMLInputElement | null;
                }}
                placeholder="e.g. John Doe"
                error={errors.name?.message}
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
                className={cn('pl-9', isSubmitting && 'opacity-50 cursor-not-allowed')}
              />
              {errors.name && (
                <p id="name-error" role="alert" className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          {/* Company Field */}
          <div className="space-y-1.5 relative">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
              Company
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                <Building2 className="w-4 h-4" />
              </div>
              <Input
                placeholder="e.g. Acme Corp"
                error={errors.company?.message}
                {...register('company')}
                disabled={isSubmitting}
                aria-invalid={!!errors.company}
                aria-describedby={errors.company ? 'company-error' : undefined}
                className={cn('pl-9', isSubmitting && 'opacity-50 cursor-not-allowed')}
              />
              {errors.company && (
                <p id="company-error" role="alert" className="text-red-500 text-sm mt-1">
                  {errors.company.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* --- Contact Section --- */}
        <div className="space-y-1.5 relative">
          <label className="text-sm font-semibold text-slate-700">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <Input
              type="email"
              placeholder="contact@example.com"
              error={errors.email?.message}
              {...register('email')}
              disabled={isSubmitting}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
              className={cn('pl-9', isSubmitting && 'opacity-50 cursor-not-allowed')}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* --- Notes Section --- */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-slate-400" />
            Internal Notes
          </label>
          <Textarea
            placeholder="Add any specific requirements, preferences, or background info..."
            rows={4}
            error={errors.notes?.message}
            {...register('notes')}
            disabled={isSubmitting}
            aria-invalid={!!errors.notes}
            aria-describedby={errors.notes ? 'notes-error' : undefined}
            className={cn('resize-none', isSubmitting && 'opacity-50 cursor-not-allowed')}
          />
          {errors.notes && (
            <p id="notes-error" role="alert" className="text-red-500 text-sm mt-1">
              {errors.notes.message}
            </p>
          )}
        </div>

        {/* --- Footer Actions --- */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isSubmitting}
            className="shadow-lg shadow-indigo-500/20"
          >
            {isEditing ? 'Save Changes' : 'Add Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientFormModal;