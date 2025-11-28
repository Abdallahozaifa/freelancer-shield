import { apiClient } from './client';
import type { Project, ProjectCreate, ProjectUpdate, ProjectStatus, PaginatedResponse } from '../types';

export const projectsApi = {
  getAll: async (
    skip = 0,
    limit = 100,
    status?: ProjectStatus,
    clientId?: string
  ): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get<{ projects: Project[]; total: number }>('/projects', {
      params: { skip, limit, status, client_id: clientId },
    });
    // API returns { projects: [...], total } but we need { items: [...], total }
    return {
      items: response.data.projects,
      total: response.data.total,
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
