import { apiClient } from './client';
import type { DashboardSummary, Alert, ProjectHealth } from '../types';

// Extended types for dashboard
export interface RecentActivity {
  type: 'request_created' | 'request_analyzed' | 'proposal_sent' | 'proposal_accepted' | 'scope_completed';
  message: string;
  project_id: string;
  project_name: string;
  timestamp: string;
}

export interface DashboardResponse {
  summary: DashboardSummary;
  alerts: Alert[];
  recent_activity: RecentActivity[];
  project_health: ProjectHealth[];
}

export const dashboardApi = {
  // Get full dashboard data (recommended - single API call)
  getFull: async (): Promise<DashboardResponse> => {
    const response = await apiClient.get<DashboardResponse>('/dashboard');
    return response.data;
  },

  // Individual endpoints (if needed separately)
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

  // Get health for a specific project
  getProjectHealth: async (projectId: string): Promise<ProjectHealth> => {
    const response = await apiClient.get<ProjectHealth>(`/dashboard/projects/${projectId}/health`);
    return response.data;
  },
};

export default dashboardApi;
