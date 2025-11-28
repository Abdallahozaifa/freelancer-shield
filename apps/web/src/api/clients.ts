import { apiClient } from './client';
import type { Client, ClientCreate, ClientUpdate, PaginatedResponse } from '../types';

export const clientsApi = {
  getAll: async (skip = 0, limit = 100): Promise<PaginatedResponse<Client>> => {
    const response = await apiClient.get<Client[]>('/clients', {
      params: { skip, limit },
    });
    return {
      items: response.data,
      total: response.data.length,
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
