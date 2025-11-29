import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi, type RecentActivity, type DashboardResponse } from '../api/dashboard';
import type { DashboardSummary, Alert, ProjectHealth } from '../types';

// Re-export for convenience
export type { RecentActivity, DashboardResponse };

// Keys for query invalidation
export const dashboardKeys = {
  all: ['dashboard'] as const,
  full: () => [...dashboardKeys.all, 'full'] as const,
  summary: () => [...dashboardKeys.all, 'summary'] as const,
  alerts: (limit?: number) => [...dashboardKeys.all, 'alerts', limit] as const,
  activity: (limit?: number) => [...dashboardKeys.all, 'activity', limit] as const,
  projectHealth: (projectId: string) => [...dashboardKeys.all, 'project-health', projectId] as const,
};

// Use the FULL dashboard endpoint - single API call for all data
export function useFullDashboard(options?: { refetchInterval?: number }) {
  const { refetchInterval = 5 * 60 * 1000 } = options || {};
  
  return useQuery({
    queryKey: dashboardKeys.full(),
    queryFn: dashboardApi.getFull,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval,
  });
}

// Individual hooks (for cases where you only need specific data)
export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardKeys.summary(),
    queryFn: dashboardApi.getSummary,
    staleTime: 2 * 60 * 1000,
  });
}

export function useDashboardAlerts(limit = 10) {
  return useQuery({
    queryKey: dashboardKeys.alerts(limit),
    queryFn: () => dashboardApi.getAlerts(limit),
    staleTime: 1 * 60 * 1000,
  });
}

export function useRecentActivity(limit = 20) {
  return useQuery({
    queryKey: dashboardKeys.activity(limit),
    queryFn: () => dashboardApi.getRecentActivity(limit),
    staleTime: 1 * 60 * 1000,
  });
}

export function useProjectHealth(projectId: string) {
  return useQuery({
    queryKey: dashboardKeys.projectHealth(projectId),
    queryFn: () => dashboardApi.getProjectHealth(projectId),
    staleTime: 2 * 60 * 1000,
    enabled: !!projectId,
  });
}

// Combined hook for dashboard - uses SINGLE API call for efficiency
export function useDashboard(options?: { 
  refetchInterval?: number;
}) {
  const { 
    refetchInterval = 5 * 60 * 1000, // 5 minutes default
  } = options || {};

  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: dashboardKeys.full(),
    queryFn: dashboardApi.getFull,
    staleTime: 2 * 60 * 1000,
    refetchInterval,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
  };

  return {
    summary: query.data?.summary,
    alerts: query.data?.alerts ?? [],
    projectHealth: query.data?.project_health ?? [],
    activity: query.data?.recent_activity ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    error: query.error,
    refresh,
  };
}
