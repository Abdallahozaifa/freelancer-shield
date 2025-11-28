import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input, Textarea } from '../../../components/ui';
import type { ScopeItem, ScopeItemCreate, ScopeItemUpdate } from '../../../types';

interface ScopeItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ScopeItemCreate | ScopeItemUpdate) => void;
  item?: ScopeItem | null;
  isLoading?: boolean;
}

interface FormValues {
  title: string;
  description: string;
  estimated_hours: string;
}

export const ScopeItemForm: React.FC<ScopeItemFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  isLoading = false,
}) => {
  const isEditing = !!item;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      estimated_hours: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          title: item.title,
          description: item.description || '',
          estimated_hours: item.estimated_hours?.toString() || '',
        });
      } else {
        reset({
          title: '',
          description: '',
          estimated_hours: '',
        });
      }
    }
  }, [isOpen, item, reset]);

  const handleFormSubmit = (data: FormValues) => {
    const payload: ScopeItemCreate | ScopeItemUpdate = {
      title: data.title.trim(),
      description: data.description.trim() || null,
      estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
    };
    onSubmit(payload);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Scope Item' : 'Add Scope Item'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Title"
          placeholder="e.g., Build user authentication"
          error={errors.title?.message}
          {...register('title', {
            required: 'Title is required',
            minLength: {
              value: 2,
              message: 'Title must be at least 2 characters',
            },
            maxLength: {
              value: 200,
              message: 'Title must be less than 200 characters',
            },
          })}
        />

        <Textarea
          label="Description"
          placeholder="Optional details about this scope item..."
          rows={3}
          error={errors.description?.message}
          {...register('description', {
            maxLength: {
              value: 1000,
              message: 'Description must be less than 1000 characters',
            },
          })}
        />

        <Input
          label="Estimated Hours"
          type="number"
          step="0.5"
          min="0"
          placeholder="e.g., 8"
          error={errors.estimated_hours?.message}
          {...register('estimated_hours', {
            min: {
              value: 0,
              message: 'Hours must be positive',
            },
            max: {
              value: 1000,
              message: 'Hours must be less than 1000',
            },
          })}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
