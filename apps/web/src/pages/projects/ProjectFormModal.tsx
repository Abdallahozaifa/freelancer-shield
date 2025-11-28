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
    defaultValues: {
      name: '',
      description: '',
      client_id: '',
      status: 'active',
      budget: '',
      hourly_rate: '',
      estimated_hours: '',
    },
  });

  useEffect(() => {
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
      reset({
        name: '',
        description: '',
        client_id: '',
        status: 'active',
        budget: '',
        hourly_rate: '',
        estimated_hours: '',
      });
    }
  }, [project, reset]);

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Project' : 'New Project'}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client <span className="text-red-500">*</span>
          </label>
          <Select
            {...register('client_id', { required: 'Client is required' })}
            options={clientOptions}
            error={errors.client_id?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Name <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('name', {
              required: 'Project name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' },
            })}
            placeholder="e.g., Website Redesign"
            error={errors.name?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <Textarea
            {...register('description')}
            placeholder="Brief description of the project..."
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <Select
            {...register('status')}
            options={statusOptions}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget ($)
            </label>
            <Input
              type="number"
              step="0.01"
              {...register('budget', {
                min: { value: 0, message: 'Must be positive' },
              })}
              placeholder="5000"
              error={errors.budget?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate ($)
            </label>
            <Input
              type="number"
              step="0.01"
              {...register('hourly_rate', {
                min: { value: 0, message: 'Must be positive' },
              })}
              placeholder="75"
              error={errors.hourly_rate?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Est. Hours
            </label>
            <Input
              type="number"
              step="0.5"
              {...register('estimated_hours', {
                min: { value: 0, message: 'Must be positive' },
              })}
              placeholder="40"
              error={errors.estimated_hours?.message}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting || createProject.isPending || updateProject.isPending}
          >
            {isEditing ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
