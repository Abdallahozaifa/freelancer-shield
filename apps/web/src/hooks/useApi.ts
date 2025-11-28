import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { clientsApi } from '../api/clients';
import { projectsApi } from '../api/projects';
import { scopeApi } from '../api/scope';
import { requestsApi } from '../api/requests';
import { proposalsApi } from '../api/proposals';
import { dashboardApi } from '../api/dashboard';
import type {
  Client,
  ClientCreate,
  ClientUpdate,
  Project,
  ProjectCreate,
  ProjectUpdate,
  ScopeItem,
  ScopeItemCreate,
  ScopeItemUpdate,
  ClientRequest,
  ClientRequestCreate,
  ClientRequestUpdate,
  Proposal,
  ProposalCreate,
  ProposalUpdate,
  PaginatedResponse,
} from '../types';

// ============ CLIENT HOOKS ============

export function useClients(options?: Partial<UseQueryOptions<PaginatedResponse<Client>>>) {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => clientsApi.getAll(),
    ...options,
  });
}

export function useClient(id: string, options?: Partial<UseQueryOptions<Client>>) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClientCreate) => clientsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientUpdate }) => 
      clientsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['clients', id] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// ============ PROJECT HOOKS ============

export function useProjects(clientId?: string, options?: Partial<UseQueryOptions<PaginatedResponse<Project>>>) {
  return useQuery({
    queryKey: ['projects', { clientId }],
    queryFn: () => projectsApi.getAll(0, 100, clientId),
    ...options,
  });
}

export function useProject(id: string, options?: Partial<UseQueryOptions<Project>>) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsApi.getById(id),
    enabled: !!id,
    ...options,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) => 
      projectsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

// ============ SCOPE ITEM HOOKS ============

export function useScopeItems(projectId: string, options?: Partial<UseQueryOptions<PaginatedResponse<ScopeItem>>>) {
  return useQuery({
    queryKey: ['projects', projectId, 'scope-items'],
    queryFn: () => scopeApi.getByProject(projectId),
    enabled: !!projectId,
    ...options,
  });
}

export function useCreateScopeItem(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ScopeItemCreate) => scopeApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'scope-items'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useUpdateScopeItem(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ScopeItemUpdate }) => 
      scopeApi.update(projectId, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'scope-items'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

export function useDeleteScopeItem(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => scopeApi.delete(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'scope-items'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
    },
  });
}

// ============ CLIENT REQUEST HOOKS ============

export function useClientRequests(projectId: string, options?: Partial<UseQueryOptions<PaginatedResponse<ClientRequest>>>) {
  return useQuery({
    queryKey: ['projects', projectId, 'requests'],
    queryFn: () => requestsApi.getByProject(projectId),
    enabled: !!projectId,
    ...options,
  });
}

export function useClientRequest(projectId: string, id: string, options?: Partial<UseQueryOptions<ClientRequest>>) {
  return useQuery({
    queryKey: ['projects', projectId, 'requests', id],
    queryFn: () => requestsApi.getById(projectId, id),
    enabled: !!projectId && !!id,
    ...options,
  });
}

export function useCreateClientRequest(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClientRequestCreate) => requestsApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateClientRequest(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClientRequestUpdate }) => 
      requestsApi.update(projectId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'requests', id] });
    },
  });
}

export function useDeleteClientRequest(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestsApi.delete(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAnalyzeRequest(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestsApi.analyze(projectId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'requests'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'requests', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ============ PROPOSAL HOOKS ============

export function useProposals(projectId: string, options?: Partial<UseQueryOptions<PaginatedResponse<Proposal>>>) {
  return useQuery({
    queryKey: ['projects', projectId, 'proposals'],
    queryFn: () => proposalsApi.getByProject(projectId),
    enabled: !!projectId,
    ...options,
  });
}

export function useProposal(projectId: string, id: string, options?: Partial<UseQueryOptions<Proposal>>) {
  return useQuery({
    queryKey: ['projects', projectId, 'proposals', id],
    queryFn: () => proposalsApi.getById(projectId, id),
    enabled: !!projectId && !!id,
    ...options,
  });
}

export function useCreateProposal(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProposalCreate) => proposalsApi.create(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useUpdateProposal(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProposalUpdate }) => 
      proposalsApi.update(projectId, id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'proposals', id] });
    },
  });
}

export function useDeleteProposal(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proposalsApi.delete(projectId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useSendProposal(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => proposalsApi.send(projectId, id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'proposals'] });
      queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'proposals', id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

// ============ DASHBOARD HOOKS ============

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.getSummary,
  });
}

export function useDashboardAlerts(limit = 10) {
  return useQuery({
    queryKey: ['dashboard', 'alerts', limit],
    queryFn: () => dashboardApi.getAlerts(limit),
  });
}

export function useProjectHealth() {
  return useQuery({
    queryKey: ['dashboard', 'project-health'],
    queryFn: dashboardApi.getProjectHealth,
  });
}
