import { apiClient } from './client';
import type { Proposal, ProposalCreate, ProposalUpdate, PaginatedResponse } from '../types';

export const proposalsApi = {
  getByProject: async (projectId: string, skip = 0, limit = 100): Promise<PaginatedResponse<Proposal>> => {
    const response = await apiClient.get<Proposal[]>(`/projects/${projectId}/proposals`, {
      params: { skip, limit },
    });
    return {
      items: response.data,
      total: response.data.length,
    };
  },

  getById: async (projectId: string, id: string): Promise<Proposal> => {
    const response = await apiClient.get<Proposal>(`/projects/${projectId}/proposals/${id}`);
    return response.data;
  },

  create: async (projectId: string, data: ProposalCreate): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(`/projects/${projectId}/proposals`, data);
    return response.data;
  },

  update: async (projectId: string, id: string, data: ProposalUpdate): Promise<Proposal> => {
    const response = await apiClient.patch<Proposal>(`/projects/${projectId}/proposals/${id}`, data);
    return response.data;
  },

  delete: async (projectId: string, id: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/proposals/${id}`);
  },

  send: async (projectId: string, id: string): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(`/projects/${projectId}/proposals/${id}/send`);
    return response.data;
  },

  accept: async (projectId: string, id: string): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(`/projects/${projectId}/proposals/${id}/accept`);
    return response.data;
  },

  decline: async (projectId: string, id: string): Promise<Proposal> => {
    const response = await apiClient.post<Proposal>(`/projects/${projectId}/proposals/${id}/decline`);
    return response.data;
  },
};

export default proposalsApi;
