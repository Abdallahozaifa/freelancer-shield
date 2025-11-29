import { apiClient } from './client';
import type { DashboardSummary, Alert, ProjectHealth } from '../types';

export interface RecentActivity {
  id: string;
  type: 'request_created' | 'scope_completed' | 'proposal_sent' | 'proposal_accepted' | 'project_created';
  message: string;
  project_id?: string;
  project_name?: string;
  created_at: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  alerts: Alert[];
  project_health: ProjectHealth[];
  recent_activity: RecentActivity[];
}

export const dashboardApi = {
  // Get full dashboard data in single call
  getFull: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>('/dashboard');
    return response.data;
  },

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

  getRecentActivity: async (limit = 20): Promise<RecentActivity[]> => {
    const response = await apiClient.get<RecentActivity[]>('/dashboard/activity', {
      params: { limit },
    });
    return response.data;
  },

  getProjectHealth: async (projectId: string): Promise<ProjectHealth> => {
    const response = await apiClient.get<ProjectHealth>(`/dashboard/projects/${projectId}/health`);
    return response.data;
  },
};

export default dashboardApi;
