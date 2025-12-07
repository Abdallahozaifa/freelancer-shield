import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Briefcase, 
  AlignLeft, 
  DollarSign, 
  Clock, 
  User, 
  Activity, 
  Hash,
  Calculator
} from 'lucide-react';
import { Modal, Input, Select, Textarea, Button, useToast } from '../../components/ui';
import { useClients } from '../../hooks/useClients';
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects';
import type { Project, ProjectCreate, ProjectStatus } from '../../types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSuccess?: () => void;
}

interface FormData {
  name: string;
  description: string;
  client_id: string;
  status: ProjectStatus;
  budget: string;
  hourly_rate: string;
  estimated_hours: string;
}

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getDefaultValues = (): FormData => ({
  name: '',
  description: '',
  client_id: '',
  status: 'active',
  budget: '',
  hourly_rate: '',
  estimated_hours: '',
});

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  project,
  onSuccess,
}) => {
  const isEditing = !!project;
  const { data: clientsData } = useClients();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: getDefaultValues(),
  });

  useEffect(() => {
    if (isOpen) {
      if (project) {
        reset({
          name: project.name,
          description: project.description || '',
          client_id: project.client_id,
          status: project.status,
          budget: project.budget?.toString() || '',
          hourly_rate: project.hourly_rate?.toString() || '',
          estimated_hours: project.estimated_hours?.toString() || '',
        });
      } else {
        reset(getDefaultValues());
      }
    }
  }, [isOpen, project, reset]);

  const onSubmit = async (data: FormData) => {
    const payload: ProjectCreate = {
      name: data.name,
      description: data.description || null,
      client_id: data.client_id,
      status: data.status,
      budget: data.budget ? parseFloat(data.budget) : null,
      hourly_rate: data.hourly_rate ? parseFloat(data.hourly_rate) : null,
      estimated_hours: data.estimated_hours ? parseFloat(data.estimated_hours) : null,
    };

    try {
      if (isEditing && project) {
        await updateProject.mutateAsync({ id: project.id, data: payload });
      } else {
        await createProject.mutateAsync(payload);
        toast.success('Project created successfully');
      }
      reset(getDefaultValues());
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(isEditing ? 'Failed to update project' : 'Failed to create project');
    }
  };

  const clientOptions = [
    { value: '', label: 'Select a client...' },
    ...(clientsData?.items?.map((client) => ({
      value: client.id,
      label: client.name,
    })) ?? []),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project Details' : 'Create New Project'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-6">
        
        {/* --- Section 1: Core Details --- */}
        <div className="space-y-4 sm:space-y-5">
          {/* Client & Status - Stack on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Client Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                Client <span className="text-red-500">*</span>
              </label>
              <Select
                {...register('client_id', { required: 'Please select a client' })}
                options={clientOptions}
                error={errors.client_id?.message}
                className="w-full"
              />
            </div>

            {/* Status Selection */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                Project Status
              </label>
              <Select
                {...register('status')}
                options={statusOptions}
                className="w-full"
              />
            </div>
          </div>

          {/* Project Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-slate-400" />
              Project Name <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('name', {
                required: 'Project name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
              })}
              placeholder="e.g., Q4 Marketing Campaign"
              error={errors.name?.message}
              className="w-full"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-400" />
              Description
            </label>
            <Textarea
              {...register('description')}
              placeholder="Outline the main goals and deliverables..."
              rows={3}
              className="resize-none text-sm sm:text-base"
            />
          </div>
        </div>

        {/* --- Section 2: Financials & Scope --- */}
        <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-100 space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60">
            <Calculator className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">
              Financials & Scope
            </h3>
          </div>
          
          {/* Financial inputs - Stack on mobile, 3 columns on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Total Budget */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Total Budget
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  <DollarSign className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  {...register('budget', { min: { value: 0, message: 'Must be positive' } })}
                  placeholder="0.00"
                  error={errors.budget?.message}
                  className="pl-9 bg-white"
                />
              </div>
            </div>

            {/* Hourly Rate */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Hourly Rate
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  <Hash className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  {...register('hourly_rate', { min: { value: 0, message: 'Must be positive' } })}
                  placeholder="0.00"
                  error={errors.hourly_rate?.message}
                  className="pl-9 bg-white"
                />
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Est. Hours
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  <Clock className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  step="0.5"
                  {...register('estimated_hours', { min: { value: 0, message: 'Must be positive' } })}
                  placeholder="0.0"
                  error={errors.estimated_hours?.message}
                  className="pl-9 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* --- Footer - Stack buttons on mobile --- */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="w-full sm:w-auto text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto px-6 shadow-lg shadow-indigo-500/20"
            isLoading={isSubmitting || createProject.isPending || updateProject.isPending}
          >
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};