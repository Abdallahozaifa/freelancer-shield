import { apiClient } from './client';
import type {
  PortalSettings,
  PortalSettingsUpdate,
  ClientPortalAccess,
  PortalInvoice,
  PortalInvoiceCreate,
  PortalInvoiceUpdate,
  PortalFile,
  PortalFileCreate,
  PortalMessage,
  PortalMessageCreate,
  PortalContract,
  PortalContractCreate,
  InvoiceStatus,
} from '@/types';

// ==================== Portal Settings ====================

export const portalSettingsApi = {
  get: async (): Promise<PortalSettings> => {
    const response = await apiClient.get<PortalSettings>('/portal/settings');
    return response.data;
  },

  update: async (data: PortalSettingsUpdate): Promise<PortalSettings> => {
    const response = await apiClient.put<PortalSettings>('/portal/settings', data);
    return response.data;
  },
};

// ==================== Client Portal Access ====================

export const portalClientsApi = {
  list: async (): Promise<ClientPortalAccess[]> => {
    const response = await apiClient.get<ClientPortalAccess[]>('/portal/clients');
    return response.data;
  },

  invite: async (clientId: string): Promise<ClientPortalAccess> => {
    const response = await apiClient.post<ClientPortalAccess>(
      `/portal/clients/${clientId}/invite`
    );
    return response.data;
  },

  revoke: async (clientId: string): Promise<void> => {
    await apiClient.delete(`/portal/clients/${clientId}/access`);
  },
};

// ==================== Invoices ====================

interface InvoiceListResponse {
  invoices: PortalInvoice[];
  total: number;
}

export const portalInvoicesApi = {
  list: async (params?: {
    client_id?: string;
    status?: InvoiceStatus;
    skip?: number;
    limit?: number;
  }): Promise<InvoiceListResponse> => {
    const response = await apiClient.get<InvoiceListResponse>('/portal/invoices', {
      params,
    });
    return response.data;
  },

  get: async (id: string): Promise<PortalInvoice> => {
    const response = await apiClient.get<PortalInvoice>(`/portal/invoices/${id}`);
    return response.data;
  },

  create: async (data: PortalInvoiceCreate): Promise<PortalInvoice> => {
    const response = await apiClient.post<PortalInvoice>('/portal/invoices', data);
    return response.data;
  },

  update: async (id: string, data: PortalInvoiceUpdate): Promise<PortalInvoice> => {
    const response = await apiClient.put<PortalInvoice>(`/portal/invoices/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/portal/invoices/${id}`);
  },

  markAsSent: async (id: string): Promise<PortalInvoice> => {
    const response = await apiClient.put<PortalInvoice>(`/portal/invoices/${id}`, {
      status: 'sent',
    });
    return response.data;
  },

  markAsPaid: async (id: string): Promise<PortalInvoice> => {
    const response = await apiClient.put<PortalInvoice>(`/portal/invoices/${id}`, {
      status: 'paid',
    });
    return response.data;
  },
};

// ==================== Files ====================

interface FileListResponse {
  files: PortalFile[];
  total: number;
}

export const portalFilesApi = {
  list: async (params?: {
    client_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<FileListResponse> => {
    const response = await apiClient.get<FileListResponse>('/portal/files', {
      params,
    });
    return response.data;
  },

  create: async (data: PortalFileCreate): Promise<PortalFile> => {
    const response = await apiClient.post<PortalFile>('/portal/files', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/portal/files/${id}`);
  },
};

// ==================== Messages ====================

interface MessageListResponse {
  messages: PortalMessage[];
  total: number;
  unread_count: number;
}

export const portalMessagesApi = {
  list: async (params?: {
    client_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<MessageListResponse> => {
    const response = await apiClient.get<MessageListResponse>('/portal/messages', {
      params,
    });
    return response.data;
  },

  send: async (data: PortalMessageCreate): Promise<PortalMessage> => {
    const response = await apiClient.post<PortalMessage>('/portal/messages', data);
    return response.data;
  },

  markAsRead: async (id: string): Promise<PortalMessage> => {
    const response = await apiClient.put<PortalMessage>(`/portal/messages/${id}/read`);
    return response.data;
  },
};

// ==================== Contracts ====================

interface ContractListResponse {
  contracts: PortalContract[];
  total: number;
}

export const portalContractsApi = {
  list: async (params?: {
    client_id?: string;
    skip?: number;
    limit?: number;
  }): Promise<ContractListResponse> => {
    const response = await apiClient.get<ContractListResponse>('/portal/contracts', {
      params,
    });
    return response.data;
  },

  create: async (data: PortalContractCreate): Promise<PortalContract> => {
    const response = await apiClient.post<PortalContract>('/portal/contracts', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/portal/contracts/${id}`);
  },
};
