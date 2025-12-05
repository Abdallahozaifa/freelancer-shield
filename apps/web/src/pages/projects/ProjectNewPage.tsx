import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Card, Button, Input, Select, Textarea } from '../../components/ui';
import { PageHeader } from '../../layouts/PageHeader';
import { useClients } from '../../hooks/useClients';
import { useCreateProject } from '../../hooks/useProjects';
import type { ProjectCreate, ProjectStatus } from '../../types';

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

const getDefaultValues = (clientId: string = ''): FormData => ({
  name: '',
  description: '',
  client_id: clientId,
  status: 'active',
  budget: '',
  hourly_rate: '',
  estimated_hours: '',
});

export const ProjectNewPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client') || '';
  
  const { data: clientsData } = useClients();
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: getDefaultValues(preselectedClientId),
  });

  // Reset form when component mounts or when navigating to this page
  useEffect(() => {
    reset(getDefaultValues(preselectedClientId));
  }, [reset, preselectedClientId]);

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
      const newProject = await createProject.mutateAsync(payload);
      // Reset form before navigating (in case user comes back)
      reset(getDefaultValues());
      // Navigate to the new project
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
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
    <div className="space-y-6">
      <PageHeader
        title="New Project"
        description="Create a new project for a client"
      />

      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
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
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createProject.isPending}
            >
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
