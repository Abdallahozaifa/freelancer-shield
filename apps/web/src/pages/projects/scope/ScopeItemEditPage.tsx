import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Target,
  AlignLeft,
  Clock,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Input, Textarea, Button, useToast } from '../../../components/ui';
import {
  useScopeItems,
  useCreateScopeItem,
  useUpdateScopeItem,
} from '../../../hooks/useScope';
import type { ScopeItem, ScopeItemCreate, ScopeItemUpdate } from '../../../types';

interface FormValues {
  title: string;
  description: string;
  estimated_hours: string;
}

export const ScopeItemEditPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('item');
  const navigate = useNavigate();
  const toast = useToast();

  const isEditing = !!itemId;

  const { data: items, isLoading: isLoadingItems } = useScopeItems(projectId!);
  const createItem = useCreateScopeItem();
  const updateItem = useUpdateScopeItem();

  const editingItem = isEditing ? items?.find((item) => item.id === itemId) : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      estimated_hours: '',
    },
  });

  useEffect(() => {
    if (editingItem) {
      reset({
        title: editingItem.title,
        description: editingItem.description || '',
        estimated_hours: editingItem.estimated_hours?.toString() || '',
      });
    }
  }, [editingItem, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!projectId) return;

    const payload: ScopeItemCreate | ScopeItemUpdate = {
      title: data.title.trim(),
      description: data.description.trim() || null,
      estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
    };

    try {
      if (isEditing && itemId) {
        await updateItem.mutateAsync({
          projectId,
          itemId,
          data: payload,
        });
        toast.success('Deliverable updated');
      } else {
        const order = items?.length ?? 0;
        await createItem.mutateAsync({
          projectId,
          data: { ...payload, order } as ScopeItemCreate,
        });
        toast.success('Deliverable added');
      }
      navigate(`/projects/${projectId}?tab=scope`);
    } catch (error) {
      toast.error(isEditing ? 'Failed to update deliverable' : 'Failed to add deliverable');
    }
  };

  const handleCancel = () => {
    navigate(`/projects/${projectId}?tab=scope`);
  };

  if (isLoadingItems && isEditing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isEditing && !editingItem && !isLoadingItems) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Deliverable not found</h2>
        <Button variant="outline" onClick={handleCancel}>
          Back to Scope
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Cancel</span>
          </button>
          <h1 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit Deliverable' : 'Add Deliverable'}
          </h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 pb-8 space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Target className="w-4 h-4 text-slate-400" />
            Deliverable Title <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g., User Authentication System"
            error={errors.title?.message}
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 2, message: 'Must be at least 2 characters' },
              maxLength: { value: 200, message: 'Max 200 characters' },
            })}
            className="w-full text-base h-12"
          />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-slate-400" />
            Description
          </label>
          <Textarea
            placeholder="Provide specific details about acceptance criteria to prevent ambiguity..."
            rows={5}
            error={errors.description?.message}
            {...register('description', {
              maxLength: { value: 1000, message: 'Max 1000 characters' },
            })}
            className="resize-none text-base"
          />
          <p className="text-xs text-slate-400">
            Be specific about what's included to prevent scope creep.
          </p>
        </div>

        {/* Time Estimate Section */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Clock className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Time Estimate
            </h3>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Estimated Hours
            </label>
            <Input
              type="number"
              step="0.5"
              min="0"
              inputMode="decimal"
              placeholder="0.0"
              error={errors.estimated_hours?.message}
              {...register('estimated_hours', {
                min: { value: 0, message: 'Must be positive' },
                max: { value: 1000, message: 'Max 1000 hours' },
              })}
              className="text-base h-12"
            />
            <p className="text-xs text-slate-400">
              Used to calculate project progress and resource planning.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold shadow-lg shadow-indigo-500/20"
            isLoading={isSubmitting || createItem.isPending || updateItem.isPending}
          >
            {isEditing ? 'Save Changes' : 'Add Deliverable'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ScopeItemEditPage;
