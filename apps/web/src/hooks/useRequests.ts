import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { requestsApi } from '../api/requests';
import { proposalsApi } from '../api/proposals';
import { projectKeys } from './useProjects';
import type {
  ClientRequest,
  ClientRequestCreate,
  ClientRequestUpdate,
  ScopeClassification,
  RequestStatus,
  ProposalCreate,
} from '../types';

export const requestKeys = {
  all: ['requests'] as const,
  lists: () => [...requestKeys.all, 'list'] as const,
  list: (projectId: string, filters?: string) => [...requestKeys.lists(), projectId, filters] as const,
  details: () => [...requestKeys.all, 'detail'] as const,
  detail: (projectId: string, id: string) => [...requestKeys.details(), projectId, id] as const,
};

export interface RequestFilters {
  classification?: ScopeClassification;
  status?: RequestStatus;
  showActive?: boolean;
}

export function useRequests(projectId: string, filters?: RequestFilters) {
  const filterKey = JSON.stringify(filters || {});
  
  return useQuery({
    queryKey: requestKeys.list(projectId, filterKey),
    queryFn: () => requestsApi.getByProject(projectId),
    enabled: !!projectId,
    select: (data) => {
      const allItems = data?.items ?? [];
      let filteredItems = [...allItems];
      
      // showActive: true = exclude addressed/declined
      // showActive: false/undefined = include all (for history view)
      if (filters?.showActive) {
        filteredItems = filteredItems.filter(
          r => r.status !== 'declined' && r.status !== 'addressed'
        );
      }
      
      if (filters?.classification) {
        filteredItems = filteredItems.filter(r => r.classification === filters.classification);
      }
      
      if (filters?.status) {
        filteredItems = filteredItems.filter(r => r.status === filters.status);
      }
      
      return {
        items: filteredItems,
        total: filteredItems.length,
        allItems: allItems,
      };
    },
  });
}

export function useRequest(projectId: string, requestId: string) {
  return useQuery({
    queryKey: requestKeys.detail(projectId, requestId),
    queryFn: () => requestsApi.getById(projectId, requestId),
    enabled: !!projectId && !!requestId,
  });
}

export function useCreateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ClientRequestCreate }) =>
      requestsApi.create(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'list'] });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      requestId,
      data,
    }: {
      projectId: string;
      requestId: string;
      data: ClientRequestUpdate;
    }) => requestsApi.update(projectId, requestId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'list'] });
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(variables.projectId, variables.requestId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, requestId }: { projectId: string; requestId: string }) =>
      requestsApi.delete(projectId, requestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'list'] });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}

export function useAnalyzeRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, requestId }: { projectId: string; requestId: string }) =>
      requestsApi.analyze(projectId, requestId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'list'] });
      queryClient.invalidateQueries({
        queryKey: requestKeys.detail(variables.projectId, variables.requestId),
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
    },
  });
}

export function useCreateProposalFromRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: ProposalCreate }) =>
      proposalsApi.create(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['requests', 'list'] });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.projectId) });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

// Helper to compute request statistics
export function useRequestStats(projectId: string) {
  const { data, isLoading } = useRequests(projectId);

  const stats = {
    total: 0,
    inScope: 0,
    outOfScope: 0,
    clarificationNeeded: 0,
    addressed: 0,
    declined: 0,
    active: 0,
  };

  const allItems = data?.allItems;
  if (allItems && Array.isArray(allItems)) {
    stats.total = allItems.length;
    allItems.forEach((request) => {
      // Count by status
      if (request.status === 'addressed') {
        stats.addressed++;
      } else if (request.status === 'declined') {
        stats.declined++;
      } else {
        stats.active++;
        // Count classifications only for active requests
        switch (request.classification) {
          case 'in_scope':
            stats.inScope++;
            break;
          case 'out_of_scope':
            stats.outOfScope++;
            break;
          case 'clarification_needed':
            stats.clarificationNeeded++;
            break;
        }
      }
    });
  }

  return { stats, isLoading };
}
