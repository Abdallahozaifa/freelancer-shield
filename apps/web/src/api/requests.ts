import { apiClient } from './client';
import type { 
  ClientRequest, 
  ClientRequestCreate, 
  ClientRequestUpdate, 
  PaginatedResponse,
  ScopeAnalysisResult 
} from '../types';

// API response type from backend
interface ApiPaginatedResponse<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export const requestsApi = {
  getByProject: async (projectId: string, skip = 0, limit = 100): Promise<PaginatedResponse<ClientRequest>> => {
    const response = await apiClient.get<ApiPaginatedResponse<ClientRequest>>(`/projects/${projectId}/requests`, {
      params: { skip, limit },
    });
    // Backend already returns { items, total, skip, limit }
    return {
      items: response.data.items,
      total: response.data.total,
    };
  },

  getById: async (projectId: string, id: string): Promise<ClientRequest> => {
    const response = await apiClient.get<ClientRequest>(`/projects/${projectId}/requests/${id}`);
    return response.data;
  },

  create: async (projectId: string, data: ClientRequestCreate): Promise<ClientRequest> => {
    const response = await apiClient.post<ClientRequest>(`/projects/${projectId}/requests`, data);
    return response.data;
  },

  update: async (projectId: string, id: string, data: ClientRequestUpdate): Promise<ClientRequest> => {
    const response = await apiClient.patch<ClientRequest>(`/projects/${projectId}/requests/${id}`, data);
    return response.data;
  },

  delete: async (projectId: string, id: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/requests/${id}`);
  },

  analyze: async (projectId: string, id: string): Promise<ScopeAnalysisResult> => {
    const response = await apiClient.post<ScopeAnalysisResult>(`/projects/${projectId}/requests/${id}/analyze`);
    return response.data;
  },
};

export default requestsApi;
