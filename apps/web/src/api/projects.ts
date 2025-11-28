import { apiClient } from './client';
import type { Project, ProjectCreate, ProjectUpdate, PaginatedResponse } from '../types';

export const projectsApi = {
  getAll: async (skip = 0, limit = 100, clientId?: string): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get<Project[]>('/projects', {
      params: { skip, limit, client_id: clientId },
    });
    return {
      items: response.data,
      total: response.data.length,
    };
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/projects/${id}`);
    return response.data;
  },

  create: async (data: ProjectCreate): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', data);
    return response.data;
  },

  update: async (id: string, data: ProjectUpdate): Promise<Project> => {
    const response = await apiClient.patch<Project>(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};

export default projectsApi;
