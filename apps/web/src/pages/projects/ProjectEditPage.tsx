import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  ArrowLeft,
  Briefcase,
  AlignLeft,
  DollarSign,
  Clock,
  User,
  Activity,
  Calculator,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Input, Select, Textarea, Button, useToast } from '../../components/ui';
import { useProject, useUpdateProject, projectKeys } from '../../hooks/useProjects';
import { useClients } from '../../hooks/useClients';
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

export const ProjectEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: project, isLoading, error } = useProject(id!);
  const { data: clientsData } = useClients();
  const updateProject = useUpdateProject();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

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
    }
  }, [project, reset]);

  const onSubmit = async (data: FormData) => {
    if (!project) return;

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
      await updateProject.mutateAsync({ id: project.id, data: payload });
      toast.success('Project updated successfully');
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id!) });
      navigate(`/projects/${id}`);
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const clientOptions = [
    { value: '', label: 'Select a client...' },
    ...(clientsData?.items?.map((client) => ({
      value: client.id,
      label: client.name,
    })) ?? []),
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load project</h2>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            to={`/projects/${id}`}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Cancel</span>
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">Edit Project</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="p-4 pb-8 space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
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
            className="w-full text-base h-12"
          />
        </div>

        {/* Client Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            Client <span className="text-red-500">*</span>
          </label>
          <Select
            {...register('client_id', { required: 'Please select a client' })}
            options={clientOptions}
            error={errors.client_id?.message}
            className="w-full text-base h-12"
          />
        </div>

        {/* Status Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-400" />
            Project Status
          </label>
          <Select
            {...register('status')}
            options={statusOptions}
            className="w-full text-base h-12"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-slate-400" />
            Description
          </label>
          <Textarea
            {...register('description')}
            placeholder="Outline the main goals and deliverables..."
            rows={4}
            className="resize-none text-base"
          />
        </div>

        {/* Financials & Scope */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calculator className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Financials & Scope
            </h3>
          </div>

          {/* Budget and Hourly Rate */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Total Budget
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <DollarSign className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  {...register('budget', { min: { value: 0, message: 'Must be positive' } })}
                  placeholder="0.00"
                  error={errors.budget?.message}
                  className="pl-9 text-base h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Hourly Rate
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <DollarSign className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  {...register('hourly_rate', { min: { value: 0, message: 'Must be positive' } })}
                  placeholder="0.00"
                  error={errors.hourly_rate?.message}
                  className="pl-9 text-base h-12"
                />
              </div>
            </div>
          </div>

          {/* Estimated Hours */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Estimated Hours
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Clock className="w-4 h-4" />
              </div>
              <Input
                type="number"
                step="0.5"
                inputMode="decimal"
                {...register('estimated_hours', { min: { value: 0, message: 'Must be positive' } })}
                placeholder="0.0"
                error={errors.estimated_hours?.message}
                className="pl-9 text-base h-12"
              />
            </div>
          </div>
        </div>

        {/* Submit Button - Fixed at bottom */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold shadow-lg shadow-indigo-500/20"
            isLoading={isSubmitting || updateProject.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProjectEditPage;
