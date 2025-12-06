import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Target, AlignLeft, Clock } from 'lucide-react';
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
      title={isEditing ? 'Edit Deliverable' : 'Add New Deliverable'}
      size="md"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-6">
        
        {/* --- Main Content Section --- */}
        <div className="space-y-5">
          {/* Title Field */}
          <div className="space-y-1.5 relative">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              Deliverable Title <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                <Target className="w-4 h-4" />
              </div>
              <Input
                placeholder="e.g., User Authentication System"
                error={errors.title?.message}
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 2, message: 'Must be at least 2 characters' },
                  maxLength: { value: 200, message: 'Max 200 characters' },
                })}
                className="pl-9"
              />
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-400" />
              Description
            </label>
            <Textarea
              placeholder="Provide specific details about acceptance criteria to prevent ambiguity..."
              rows={4}
              error={errors.description?.message}
              {...register('description', {
                maxLength: { value: 1000, message: 'Max 1000 characters' },
              })}
              className="resize-none"
            />
          </div>
        </div>

        {/* --- Estimation Section --- */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center justify-between">
              Time Estimate (Hours)
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                <Clock className="w-4 h-4" />
              </div>
              <Input
                type="number"
                step="0.5"
                min="0"
                placeholder="0.0"
                error={errors.estimated_hours?.message}
                {...register('estimated_hours', {
                  min: { value: 0, message: 'Must be positive' },
                  max: { value: 1000, message: 'Max 1000 hours' },
                })}
                className="pl-9 bg-white"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Used to calculate project progress and resource planning.
            </p>
          </div>
        </div>

        {/* --- Footer --- */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isLoading}
            className="text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoading}
            className="shadow-lg shadow-indigo-500/20"
          >
            {isEditing ? 'Save Changes' : 'Add Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};