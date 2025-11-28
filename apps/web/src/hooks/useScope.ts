import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scopeApi } from '../api/scope';
import { projectKeys } from './useProjects';
import type { ScopeItem, ScopeItemCreate, ScopeItemUpdate } from '../types';

export const scopeKeys = {
  all: ['scope'] as const,
  lists: () => [...scopeKeys.all, 'list'] as const,
  list: (projectId: string) => [...scopeKeys.lists(), projectId] as const,
  details: () => [...scopeKeys.all, 'detail'] as const,
  detail: (projectId: string, id: string) => [...scopeKeys.details(), projectId, id] as const,
  progress: (projectId: string) => [...scopeKeys.all, 'progress', projectId] as const,
};

export function useScopeItems(projectId: string) {
  return useQuery({
    queryKey: scopeKeys.list(projectId),
    queryFn: () => scopeApi.getByProject(projectId),
    enabled: !!projectId,
    select: (data) => data.items.sort((a, b) => a.order - b.order),
  });
}

export function useScopeItem(projectId: string, itemId: string) {
  return useQuery({
    queryKey: scopeKeys.detail(projectId, itemId),
    queryFn: () => scopeApi.getById(projectId, itemId),
    enabled: !!projectId && !!itemId,
  });
}

export function useCreateScopeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ScopeItemCreate }) =>
      scopeApi.create(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scopeKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: scopeKeys.progress(variables.projectId) });
      // Update project scope counts
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateScopeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      itemId,
      data,
    }: {
      projectId: string;
      itemId: string;
      data: ScopeItemUpdate;
    }) => scopeApi.update(projectId, itemId, data),
    onMutate: async ({ projectId, itemId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: scopeKeys.list(projectId) });

      // Snapshot the previous value
      const previousItems = queryClient.getQueryData<{ items: ScopeItem[] }>(
        scopeKeys.list(projectId)
      );

      // Optimistically update the cache
      if (previousItems) {
        queryClient.setQueryData(scopeKeys.list(projectId), {
          ...previousItems,
          items: previousItems.items.map((item) =>
            item.id === itemId ? { ...item, ...data } : item
          ),
        });
      }

      return { previousItems };
    },
    onError: (_, variables, context) => {
      // Rollback on error
      if (context?.previousItems) {
        queryClient.setQueryData(scopeKeys.list(variables.projectId), context.previousItems);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: scopeKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: scopeKeys.progress(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteScopeItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, itemId }: { projectId: string; itemId: string }) =>
      scopeApi.delete(projectId, itemId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: scopeKeys.list(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: scopeKeys.progress(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useReorderScopeItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, itemIds }: { projectId: string; itemIds: string[] }) =>
      scopeApi.reorder(projectId, itemIds),
    onMutate: async ({ projectId, itemIds }) => {
      await queryClient.cancelQueries({ queryKey: scopeKeys.list(projectId) });

      const previousItems = queryClient.getQueryData<{ items: ScopeItem[] }>(
        scopeKeys.list(projectId)
      );

      if (previousItems) {
        const itemMap = new Map(previousItems.items.map((item) => [item.id, item]));
        const reorderedItems = itemIds
          .map((id, index) => {
            const item = itemMap.get(id);
            return item ? { ...item, order: index } : null;
          })
          .filter((item): item is ScopeItem => item !== null);

        queryClient.setQueryData(scopeKeys.list(projectId), {
          ...previousItems,
          items: reorderedItems,
        });
      }

      return { previousItems };
    },
    onError: (_, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(scopeKeys.list(variables.projectId), context.previousItems);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: scopeKeys.list(variables.projectId) });
    },
  });
}

// Helper to safely convert estimated_hours to number
const toNumber = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? 0 : num;
};

// Calculate progress client-side from scope items
export function useScopeProgress(projectId: string) {
  const { data: items, isLoading, error } = useScopeItems(projectId);

  const progress = items
    ? {
        total_items: items.length,
        completed_items: items.filter((item) => item.is_completed).length,
        completion_percentage:
          items.length > 0
            ? Math.round(
                (items.filter((item) => item.is_completed).length / items.length) * 100
              )
            : 0,
        total_estimated_hours: items.length > 0
          ? items.reduce((sum, item) => sum + toNumber(item.estimated_hours), 0)
          : null,
        completed_estimated_hours: items.length > 0
          ? items
              .filter((item) => item.is_completed)
              .reduce((sum, item) => sum + toNumber(item.estimated_hours), 0)
          : null,
      }
    : null;

  return { data: progress, isLoading, error };
}
