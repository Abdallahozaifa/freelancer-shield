import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, DollarSign, FolderOpen, AlertTriangle, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useDashboard } from '../../hooks/useDashboard';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { cn } from '../../utils/cn';
import type { Alert, ProjectHealth } from '../../types';

// Get greeting based on time of day
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// ============ STAT CARDS ============
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  subtitle?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  subtitle,
  onClick,
}) => (
  <Card 
    className={cn(onClick && 'cursor-pointer hover:shadow-md transition-shadow')}
    padding="md"
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
      <div className={cn('flex-shrink-0 p-3 rounded-lg', iconBgColor)}>
        <div className={iconColor}>{icon}</div>
      </div>
    </div>
  </Card>
);

const StatCardSkeleton: React.FC = () => (
  <Card padding="md">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <Skeleton height={16} width="60%" />
        <div className="mt-2">
          <Skeleton height={28} width="40%" />
        </div>
        <div className="mt-2">
          <Skeleton height={12} width="50%" />
        </div>
      </div>
      <Skeleton width={48} height={48} className="rounded-lg" />
    </div>
  </Card>
);

// ============ NEEDS ATTENTION (ALERTS) ============
interface NeedsAttentionProps {
  alerts: Alert[];
  isLoading: boolean;
  onAlertClick: (projectId: string) => void;
}

const NeedsAttention: React.FC<NeedsAttentionProps> = ({ alerts, isLoading, onAlertClick }) => {
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const severityStyles = {
    high: { badge: 'danger' as const, bg: 'bg-red-50', border: 'border-red-200' },
    medium: { badge: 'warning' as const, bg: 'bg-yellow-50', border: 'border-yellow-200' },
    low: { badge: 'info' as const, bg: 'bg-blue-50', border: 'border-blue-200' },
  };

  if (isLoading) {
    return (
      <Card padding="md">
        <CardHeader>
          <Skeleton width={140} height={20} />
        </CardHeader>
        <div className="space-y-3 mt-4">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 rounded-lg border border-gray-200">
              <Skeleton height={16} width="80%" className="mb-2" />
              <Skeleton height={12} width="40%" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (alerts.length === 0) {
    return null; // Don't show section if no alerts
  }

  // Sort by severity
  const sortedAlerts = [...alerts].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.severity] - order[b.severity];
  }).slice(0, 5);

  return (
    <Card padding="md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <CardTitle>Needs Attention</CardTitle>
          <Badge variant="danger" size="sm">{alerts.length}</Badge>
        </div>
      </CardHeader>
      
      <div className="space-y-3 mt-4">
        {sortedAlerts.map((alert, index) => {
          const styles = severityStyles[alert.severity];
          return (
            <div
              key={`${alert.project_id}-${index}`}
              className={cn(
                'p-4 rounded-lg border cursor-pointer hover:shadow-sm transition-shadow',
                styles.bg,
                styles.border
              )}
              onClick={() => onAlertClick(alert.project_id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={styles.badge} size="sm">
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(alert.created_at)}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.project_name}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

// ============ ACTIVE PROJECTS LIST ============
interface ActiveProjectsListProps {
  projects: ProjectHealth[];
  isLoading: boolean;
  onProjectClick: (projectId: string) => void;
  onViewAll: () => void;
}

const ActiveProjectsList: React.FC<ActiveProjectsListProps> = ({ 
  projects, 
  isLoading, 
  onProjectClick,
  onViewAll 
}) => {
  if (isLoading) {
    return (
      <Card padding="md">
        <CardHeader>
          <Skeleton width={120} height={20} />
        </CardHeader>
        <div className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-3 border-b">
              <Skeleton height={16} width="40%" />
              <div className="flex gap-4">
                <Skeleton height={14} width={60} />
                <Skeleton height={14} width={60} />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-gray-400" />
            <CardTitle>Active Projects</CardTitle>
          </div>
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title="No active projects"
            description="Create a project to start tracking scope creep."
            action={{
              label: 'Create Project',
              onClick: onViewAll,
            }}
          />
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {/* Header Row */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <div className="col-span-6">Project</div>
            <div className="col-span-3 text-center">Scope Creep</div>
            <div className="col-span-3 text-center">Pending</div>
          </div>
          
          {/* Project Rows */}
          {projects.slice(0, 5).map((project) => (
            <div
              key={project.project_id}
              className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors items-center"
              onClick={() => onProjectClick(project.project_id)}
            >
              <div className="col-span-6">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {project.project_name}
                </p>
              </div>
              <div className="col-span-3 text-center">
                {project.out_of_scope_requests > 0 ? (
                  <Badge variant="danger" size="sm">
                    {project.out_of_scope_requests}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-400">0</span>
                )}
              </div>
              <div className="col-span-3 text-center">
                {project.pending_analysis > 0 ? (
                  <Badge variant="warning" size="sm">
                    {project.pending_analysis}
                  </Badge>
                ) : (
                  <span className="text-sm text-gray-400">0</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// ============ MAIN DASHBOARD ============
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const { 
    summary, 
    alerts, 
    projectHealth,
    isLoading, 
    isFetching,
    refresh 
  } = useDashboard({
    refetchInterval: 5 * 60 * 1000,
  });

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            {getGreeting()}, {firstName}!
          </p>
        </div>
        
        <button
          onClick={refresh}
          disabled={isFetching}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors',
            isFetching && 'opacity-50 cursor-not-allowed'
          )}
        >
          <RefreshCw className={cn('w-4 h-4', isFetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Stats Cards - 3 key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title="Revenue Protected"
              value={formatCurrency(summary?.total_revenue_protected ?? 0)}
              icon={<DollarSign className="w-5 h-5" />}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
              subtitle={`${summary?.accepted_proposals ?? 0} proposals accepted`}
              onClick={() => navigate('/proposals')}
            />
            <StatCard
              title="Active Projects"
              value={summary?.active_projects ?? 0}
              icon={<FolderOpen className="w-5 h-5" />}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
              subtitle={`${summary?.total_projects ?? 0} total`}
              onClick={() => navigate('/projects')}
            />
            <StatCard
              title="Scope Creep Detected"
              value={summary?.out_of_scope_requests ?? 0}
              icon={<AlertTriangle className="w-5 h-5" />}
              iconBgColor={summary?.out_of_scope_requests ? 'bg-red-100' : 'bg-gray-100'}
              iconColor={summary?.out_of_scope_requests ? 'text-red-600' : 'text-gray-400'}
              subtitle="Out-of-scope requests"
            />
          </>
        )}
      </div>

      {/* Needs Attention - Only show if there are alerts */}
      <NeedsAttention
        alerts={alerts}
        isLoading={isLoading}
        onAlertClick={(projectId) => navigate(`/projects/${projectId}`)}
      />

      {/* Active Projects - Simple list */}
      <ActiveProjectsList
        projects={projectHealth}
        isLoading={isLoading}
        onProjectClick={(projectId) => navigate(`/projects/${projectId}`)}
        onViewAll={() => navigate('/projects')}
      />
    </div>
  );
};

export default DashboardPage;
