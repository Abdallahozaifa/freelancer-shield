import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  portalSettingsApi,
  portalClientsApi,
  portalInvoicesApi,
  portalFilesApi,
  portalMessagesApi,
  portalContractsApi,
} from '@/api/portal';
import type {
  PortalSettingsUpdate,
  PortalInvoiceCreate,
  PortalInvoiceUpdate,
  PortalFileCreate,
  PortalMessageCreate,
  PortalContractCreate,
  InvoiceStatus,
} from '@/types';

// ==================== Portal Settings ====================

export function usePortalSettings() {
  return useQuery({
    queryKey: ['portal', 'settings'],
    queryFn: portalSettingsApi.get,
  });
}

export function useUpdatePortalSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortalSettingsUpdate) => portalSettingsApi.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'settings'] });
    },
  });
}

// ==================== Client Portal Access ====================

export function usePortalClients() {
  return useQuery({
    queryKey: ['portal', 'clients'],
    queryFn: portalClientsApi.list,
  });
}

export function useInviteClientToPortal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => portalClientsApi.invite(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'clients'] });
    },
  });
}

export function useRevokeClientPortalAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (clientId: string) => portalClientsApi.revoke(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'clients'] });
    },
  });
}

// ==================== Invoices ====================

export function usePortalInvoices(params?: {
  client_id?: string;
  status?: InvoiceStatus;
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['portal', 'invoices', params],
    queryFn: () => portalInvoicesApi.list(params),
  });
}

export function usePortalInvoice(id: string) {
  return useQuery({
    queryKey: ['portal', 'invoices', id],
    queryFn: () => portalInvoicesApi.get(id),
    enabled: !!id,
  });
}

export function useCreatePortalInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortalInvoiceCreate) => portalInvoicesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'invoices'] });
    },
  });
}

export function useUpdatePortalInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PortalInvoiceUpdate }) =>
      portalInvoicesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'invoices'] });
    },
  });
}

export function useDeletePortalInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portalInvoicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'invoices'] });
    },
  });
}

export function useMarkInvoiceAsSent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portalInvoicesApi.markAsSent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'invoices'] });
    },
  });
}

export function useMarkInvoiceAsPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portalInvoicesApi.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'invoices'] });
    },
  });
}

// ==================== Files ====================

export function usePortalFiles(params?: {
  client_id?: string;
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['portal', 'files', params],
    queryFn: () => portalFilesApi.list(params),
  });
}

export function useCreatePortalFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortalFileCreate) => portalFilesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'files'] });
    },
  });
}

export function useDeletePortalFile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portalFilesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'files'] });
    },
  });
}

// ==================== Messages ====================

export function usePortalMessages(params?: {
  client_id?: string;
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['portal', 'messages', params],
    queryFn: () => portalMessagesApi.list(params),
  });
}

export function useSendPortalMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortalMessageCreate) => portalMessagesApi.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'messages'] });
    },
  });
}

export function useMarkMessageAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portalMessagesApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'messages'] });
    },
  });
}

// ==================== Contracts ====================

export function usePortalContracts(params?: {
  client_id?: string;
  skip?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['portal', 'contracts', params],
    queryFn: () => portalContractsApi.list(params),
  });
}

export function useCreatePortalContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PortalContractCreate) => portalContractsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'contracts'] });
    },
  });
}

export function useDeletePortalContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => portalContractsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portal', 'contracts'] });
    },
  });
}
