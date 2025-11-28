import { apiClient } from './client';
import type { Client, ClientCreate, ClientUpdate, PaginatedResponse } from '../types';

export const clientsApi = {
  getAll: async (skip = 0, limit = 100): Promise<PaginatedResponse<Client>> => {
    const response = await apiClient.get<{ clients: Client[]; total: number }>('/clients', {
      params: { skip, limit },
    });
    // API returns { clients: [...], total } but we need { items: [...], total }
    return {
      items: response.data.clients,
      total: response.data.total,
    };
  },

  getById: async (id: string): Promise<Client> => {
    const response = await apiClient.get<Client>(`/clients/${id}`);
    return response.data;
  },

  create: async (data: ClientCreate): Promise<Client> => {
    const response = await apiClient.post<Client>('/clients', data);
    return response.data;
  },

  update: async (id: string, data: ClientUpdate): Promise<Client> => {
    const response = await apiClient.patch<Client>(`/clients/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },
};

export default clientsApi;
