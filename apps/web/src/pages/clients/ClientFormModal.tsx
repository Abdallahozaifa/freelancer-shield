import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Building2, Mail, FileText, AlignLeft } from 'lucide-react';
import { Modal, Button, Input, Textarea, useToast } from '../../components/ui';
import { useCreateClient, useUpdateClient } from '../../hooks/useClients';
import type { Client } from '../../types';

const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  company: z.string().max(100, 'Company name is too long').optional().or(z.literal('')),
  notes: z.string().max(1000, 'Notes are too long').optional().or(z.literal('')),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  const toast = useToast();
  const createMutation = useCreateClient();
  const updateMutation = useUpdateClient();

  const isEditing = !!client;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

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
        toast.success(`${data.name} has been updated.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`${data.name} added to clients.`);
      }

      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'An error occurred'
      );
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

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
                placeholder="e.g. John Doe"
                error={errors.name?.message}
                {...register('name')}
                className="pl-9"
              />
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
                className="pl-9"
              />
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
              className="pl-9"
            />
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
            className="resize-none"
          />
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