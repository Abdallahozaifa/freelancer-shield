import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projects';
import { clientKeys } from './useClients';
import type { ProjectStatus, ProjectCreate, ProjectUpdate } from '../types';

export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  list: (filters: string) => [...projectKeys.lists(), { filters }] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
};

// Helper to invalidate all dashboard-related queries
const invalidateDashboard = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['dashboard'] });
};

export function useProjects(params?: { status?: ProjectStatus; client_id?: string }) {
  const filterKey = JSON.stringify(params || {});
  return useQuery({
    queryKey: projectKeys.list(filterKey),
    queryFn: () => projectsApi.getAll(0, 100, params?.status, params?.client_id),
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data),
    onSuccess: () => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Invalidate clients list to update project_count
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      // Invalidate client details
      queryClient.invalidateQueries({ queryKey: clientKeys.details() });
      // Invalidate dashboard to update active projects count
      invalidateDashboard(queryClient);
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) =>
      projectsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      // Invalidate dashboard in case status changed
      invalidateDashboard(queryClient);
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      // Invalidate projects list
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      // Invalidate clients list to update project_count
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      // Invalidate client details
      queryClient.invalidateQueries({ queryKey: clientKeys.details() });
      // Invalidate dashboard to update counts
      invalidateDashboard(queryClient);
    },
  });
}
