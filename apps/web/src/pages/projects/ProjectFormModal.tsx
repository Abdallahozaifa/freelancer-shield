import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Input, Select, Textarea, Button } from '../../components/ui';
import { useClients } from '../../hooks/useClients';
import { useCreateProject, useUpdateProject } from '../../hooks/useProjects';
import type { Project, ProjectCreate, ProjectStatus } from '../../types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
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
}) => {
  const isEditing = !!project;
  const { data: clientsData } = useClients();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: getDefaultValues(),
  });

  // Reset form when modal opens or project changes
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
      }
      reset(getDefaultValues()); // Reset before closing
      onClose();
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };

  const clientOptions = [
    { value: '', label: 'Select a client' },
    ...(clientsData?.items?.map((client) => ({
      value: client.id,
      label: client.name,
    })) ?? []),
  ];

  const commonLabelStyle = "block text-sm font-semibold text-slate-700 mb-1";
  const requiredStar = <span className="text-red-500">*</span>;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'New Project'}
      
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Increased main spacing */}
        
        {/* --- Primary Details Group --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={commonLabelStyle}>
                    Client {requiredStar}
                </label>
                <Select
                    {...register('client_id', { required: 'Client is required' })}
                    options={clientOptions}
                    error={errors.client_id?.message}
                    className="rounded-lg" // Added rounded style
                />
            </div>

            <div>
                <label className={commonLabelStyle}>
                    Project Name {requiredStar}
                </label>
                <Input
                    {...register('name', {
                        required: 'Project name is required',
                        minLength: { value: 2, message: 'Name must be at least 2 characters' },
                    })}
                    placeholder="e.g., Website Redesign"
                    error={errors.name?.message}
                    className="rounded-lg" // Added rounded style
                />
            </div>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className={commonLabelStyle}>
                    Description
                </label>
                <Textarea
                    {...register('description')}
                    placeholder="Brief description of the project..."
                    rows={3}
                    className="rounded-lg" // Added rounded style
                />
            </div>

            <div>
                <label className={commonLabelStyle}>
                    Status
                </label>
                <Select
                    {...register('status')}
                    options={statusOptions}
                    className="rounded-lg" // Added rounded style
                />
            </div>
        </div>

        {/* --- Budget & Scope Details Group --- */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Budget & Time Estimation</h3>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className={commonLabelStyle}>
                        Budget (USD)
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        {...register('budget', {
                            min: { value: 0, message: 'Must be positive' },
                        })}
                        placeholder="5000.00"
                        error={errors.budget?.message}
                        className="rounded-lg"
                    />
                </div>

                <div>
                    <label className={commonLabelStyle}>
                        Hourly Rate (USD)
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        {...register('hourly_rate', {
                            min: { value: 0, message: 'Must be positive' },
                        })}
                        placeholder="75.00"
                        error={errors.hourly_rate?.message}
                        className="rounded-lg"
                    />
                </div>

                <div>
                    <label className={commonLabelStyle}>
                        Estimated Hours
                    </label>
                    <Input
                        type="number"
                        step="0.5"
                        {...register('estimated_hours', {
                            min: { value: 0, message: 'Must be positive' },
                        })}
                        placeholder="40.0"
                        error={errors.estimated_hours?.message}
                        className="rounded-lg"
                    />
                </div>
            </div>
        </div>

        {/* --- Footer Actions --- */}
        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200"> {/* Increased padding */}
          <Button type="button" variant="outline" onClick={onClose} className="font-semibold">
            Cancel
          </Button>
          <Button
            type="submit"
            // Ensure primary color and emphasis is strong
            className="font-semibold shadow-md shadow-indigo-400/50"
            isLoading={isSubmitting || createProject.isPending || updateProject.isPending}
          >
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};