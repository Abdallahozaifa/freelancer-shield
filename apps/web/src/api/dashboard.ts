import { apiClient } from './client';
import type { DashboardSummary, Alert, ProjectHealth } from '../types';

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>('/dashboard/summary');
    return response.data;
  },

  getAlerts: async (limit = 10): Promise<Alert[]> => {
    const response = await apiClient.get<Alert[]>('/dashboard/alerts', {
      params: { limit },
    });
    return response.data;
  },

  getProjectHealth: async (): Promise<ProjectHealth[]> => {
    const response = await apiClient.get<ProjectHealth[]>('/dashboard/project-health');
    return response.data;
  },
};

export default dashboardApi;
