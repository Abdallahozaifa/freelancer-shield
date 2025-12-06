import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Briefcase, 
  User, 
  AlignLeft, 
  DollarSign, 
  Clock, 
  Hash, 
  ArrowLeft,
  Activity
} from 'lucide-react';
import { Card, Button, Input, Select, Textarea } from '../../components/ui';
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
      reset(getDefaultValues());
      navigate(`/projects/${newProject.id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
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
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Project</h1>
          <p className="text-slate-500 text-sm">Set up the details and scope for your new engagement.</p>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          
          {/* Main Form Section */}
          <div className="p-6 md:p-8 space-y-6 bg-white">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Initial Status
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
                placeholder="e.g., Website Redesign Q4"
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
                placeholder="Briefly describe the project goals and scope..."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          {/* Financials Section */}
          <div className="bg-slate-50 p-6 md:p-8 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
              Financials & Estimates
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Budget */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-slate-500">
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
                <label className="text-xs font-semibold text-slate-500">
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

              {/* Est Hours */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold text-slate-500">
                  Estimated Hours
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

          {/* Footer Actions */}
          <div className="p-6 md:p-8 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="text-slate-500 hover:text-slate-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting || createProject.isPending}
              className="px-8 shadow-lg shadow-indigo-500/20"
            >
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};