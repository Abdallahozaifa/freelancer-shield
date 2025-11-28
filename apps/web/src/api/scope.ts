import { apiClient } from './client';
import type { ScopeItem, ScopeItemCreate, ScopeItemUpdate, PaginatedResponse } from '../types';

export const scopeApi = {
  getByProject: async (projectId: string, skip = 0, limit = 100): Promise<PaginatedResponse<ScopeItem>> => {
    const response = await apiClient.get<ScopeItem[]>(`/projects/${projectId}/scope-items`, {
      params: { skip, limit },
    });
    return {
      items: response.data,
      total: response.data.length,
    };
  },

  getById: async (projectId: string, id: string): Promise<ScopeItem> => {
    const response = await apiClient.get<ScopeItem>(`/projects/${projectId}/scope-items/${id}`);
    return response.data;
  },

  create: async (projectId: string, data: ScopeItemCreate): Promise<ScopeItem> => {
    const response = await apiClient.post<ScopeItem>(`/projects/${projectId}/scope-items`, data);
    return response.data;
  },

  update: async (projectId: string, id: string, data: ScopeItemUpdate): Promise<ScopeItem> => {
    const response = await apiClient.patch<ScopeItem>(`/projects/${projectId}/scope-items/${id}`, data);
    return response.data;
  },

  delete: async (projectId: string, id: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/scope-items/${id}`);
  },

  reorder: async (projectId: string, itemIds: string[]): Promise<ScopeItem[]> => {
    const response = await apiClient.post<ScopeItem[]>(`/projects/${projectId}/scope-items/reorder`, {
      item_ids: itemIds,
    });
    return response.data;
  },
};

export default scopeApi;
