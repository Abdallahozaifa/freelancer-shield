import { apiClient } from './client';
import type { ScopeItem, ScopeItemCreate, ScopeItemUpdate, PaginatedResponse } from '../types';

export const scopeApi = {
  getByProject: async (projectId: string): Promise<PaginatedResponse<ScopeItem>> => {
    const response = await apiClient.get<ScopeItem[]>(`/projects/${projectId}/scope`);
    return {
      items: response.data,
      total: response.data.length,
    };
  },

  getById: async (projectId: string, id: string): Promise<ScopeItem> => {
    const response = await apiClient.get<ScopeItem>(`/projects/${projectId}/scope/${id}`);
    return response.data;
  },

  create: async (projectId: string, data: ScopeItemCreate): Promise<ScopeItem> => {
    const response = await apiClient.post<ScopeItem>(`/projects/${projectId}/scope`, data);
    return response.data;
  },

  update: async (projectId: string, id: string, data: ScopeItemUpdate): Promise<ScopeItem> => {
    const response = await apiClient.patch<ScopeItem>(`/projects/${projectId}/scope/${id}`, data);
    return response.data;
  },

  delete: async (projectId: string, id: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/scope/${id}`);
  },

  reorder: async (projectId: string, itemIds: string[]): Promise<ScopeItem[]> => {
    const response = await apiClient.post<ScopeItem[]>(`/projects/${projectId}/scope/reorder`, {
      item_ids: itemIds,
    });
    return response.data;
  },

  getProgress: async (projectId: string): Promise<{
    total_items: number;
    completed_items: number;
    completion_percentage: number;
    total_estimated_hours: number | null;
    completed_estimated_hours: number | null;
  }> => {
    const response = await apiClient.get(`/projects/${projectId}/scope/progress`);
    return response.data;
  },
};

export default scopeApi;
