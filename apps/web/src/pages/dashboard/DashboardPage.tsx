import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  FolderOpen,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Clock,
  Plus,
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthStore } from '../../stores/authStore';
import { Card, StatCard, Button, Badge } from '../../components/ui';
import { formatCurrency, formatRelative } from '../../utils/format';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { summary, alerts, project_health: projects, isLoading } = useDashboard();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  // Calculate real total out-of-scope from project_health (more accurate than summary)
  const realTotalOutOfScope = projects.reduce(
    (sum, p) => sum + (p.out_of_scope_requests ?? 0),
    0
  );

  // Build a map of project_id -> out_of_scope_requests for quick lookup
  const projectOutOfScopeMap = new Map(
    projects.map((p) => [p.project_id, p.out_of_scope_requests ?? 0])
  );

  // Filter alerts to only show ones with actual out-of-scope issues
  // This filters out stale alerts where requests have been dismissed
  const validAlerts = alerts.filter((alert) => {
    // If alert is about out-of-scope requests, verify the project still has them
    if (alert.message.toLowerCase().includes('out-of-scope')) {
      const outOfScopeCount = projectOutOfScopeMap.get(alert.project_id);
      // Only show if we have data AND count > 0
      // If project not in map (e.g., on hold), don't show the alert
      return outOfScopeCount !== undefined && outOfScopeCount > 0;
    }
    // Keep non-scope-creep alerts (e.g., pending requests, etc.)
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}, {firstName}
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        <Button
          onClick={() => navigate('/projects/new')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-32 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
                <div className="h-8 bg-slate-200 rounded w-20 mb-2" />
                <div className="h-3 bg-slate-100 rounded w-32" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Revenue Protected"
              value={formatCurrency(summary?.revenue_protected ?? 0)}
              subtitle={`${summary?.proposals_accepted ?? 0} proposals accepted`}
              icon={<DollarSign className="w-6 h-6" />}
              iconVariant="success"
            />
            <StatCard
              title="Active Projects"
              value={summary?.active_projects ?? 0}
              subtitle={`${summary?.total_projects ?? 0} total projects`}
              icon={<FolderOpen className="w-6 h-6" />}
              iconVariant="primary"
            />
            <StatCard
              title="Pending Requests"
              value={summary?.pending_requests ?? 0}
              subtitle="Awaiting review"
              icon={<Clock className="w-6 h-6" />}
              iconVariant="warning"
            />
            <StatCard
              title="Scope Creep Detected"
              value={realTotalOutOfScope}
              subtitle="Out-of-scope requests"
              icon={<AlertTriangle className="w-6 h-6" />}
              iconVariant="danger"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Alerts Section - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          {/* Needs Attention */}
          {validAlerts.length > 0 && (
            <Card padding="none">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">Needs Attention</h2>
                    <p className="text-sm text-slate-500">{validAlerts.length} items require your review</p>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-slate-100">
                {validAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/projects/${alert.project_id}`)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={
                              alert.severity === 'HIGH'
                                ? 'danger'
                                : alert.severity === 'MEDIUM'
                                ? 'warning'
                                : 'info'
                            }
                            size="sm"
                          >
                            {alert.severity}
                          </Badge>
                          <span className="text-xs text-slate-400">
                            {formatRelative(alert.created_at)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 mb-0.5">
                          {alert.message}
                        </p>
                        <p className="text-sm text-slate-500">{alert.project_name}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
              {validAlerts.length > 5 && (
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                  <button
                    onClick={() => navigate('/projects')}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View all {validAlerts.length} alerts →
                  </button>
                </div>
              )}
            </Card>
          )}

          {/* Active Projects */}
          <Card padding="none">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100">
                  <FolderOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="font-semibold text-slate-900">Active Projects</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/projects')}
              >
                View All
              </Button>
            </div>
            
            {isLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between py-2">
                    <div className="h-4 bg-slate-200 rounded w-40" />
                    <div className="h-6 bg-slate-100 rounded w-12" />
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <FolderOpen className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium mb-1">No active projects</p>
                <p className="text-sm text-slate-400 mb-4">
                  Create your first project to start tracking scope.
                </p>
                <Button
                  size="sm"
                  onClick={() => navigate('/projects/new')}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  New Project
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-6">Project</div>
                  <div className="col-span-3 text-center">Scope Creep</div>
                  <div className="col-span-3 text-center">Progress</div>
                </div>
                
                {/* Project Rows - Show ALL projects */}
                {projects.map((project) => {
                  const progress = project.scope_items_total > 0
                    ? Math.round((project.scope_items_completed / project.scope_items_total) * 100)
                    : 0;
                    
                  return (
                    <div
                      key={project.project_id}
                      className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-slate-50 cursor-pointer transition-colors group items-center"
                      onClick={() => navigate(`/projects/${project.project_id}`)}
                    >
                      <div className="col-span-6">
                        <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                          {project.project_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{project.status}</p>
                      </div>
                      <div className="col-span-3 text-center">
                        {project.out_of_scope_requests > 0 ? (
                          <span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 bg-red-100 text-red-700 text-sm font-semibold rounded-full">
                            {project.out_of_scope_requests}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">0</span>
                        )}
                      </div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-500 tabular-nums w-8 text-right">
                            {progress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-4">
          {/* Performance Summary */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">This Month</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Revenue Protected</span>
                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(summary?.revenue_protected ?? 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Proposals Sent</span>
                <span className="text-sm font-semibold text-slate-900">
                  {summary?.total_proposals ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Acceptance Rate</span>
                <span className="text-sm font-semibold text-emerald-600">
                  {summary?.total_proposals
                    ? Math.round(((summary?.proposals_accepted ?? 0) / summary.total_proposals) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Scope Items Completed</span>
                <span className="text-sm font-semibold text-slate-900">
                  {summary?.completed_scope_items ?? 0}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/projects/new')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100">
                  <Plus className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">New Project</p>
                  <p className="text-xs text-slate-400">Create a new project</p>
                </div>
              </button>
              
              <button
                onClick={() => navigate('/clients')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100">
                  <Plus className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Add Client</p>
                  <p className="text-xs text-slate-400">Add a new client</p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
