import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
        toast.success(`${data.name} has been updated successfully.`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`${data.name} has been added to your clients.`);
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
      title={isEditing ? 'Edit Client' : 'Add Client'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name"
          placeholder="Enter client name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="client@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Company"
          placeholder="Enter company name"
          error={errors.company?.message}
          {...register('company')}
        />

        <Textarea
          label="Notes"
          placeholder="Add any notes about this client..."
          rows={3}
          error={errors.notes?.message}
          {...register('notes')}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Client'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ClientFormModal;
