import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  FolderOpen,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  Briefcase,
  Activity
} from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthStore } from '../../stores/authStore';
import { useProStatus } from '../../hooks/useProStatus';
import { useFeatureGate } from '../../hooks/useFeatureGate';
import { Card, StatCard, Button, Badge, ProBadge, ProFeatureBadge } from '../../components/ui';
import { formatCurrency, formatRelative } from '../../utils/format';
import { Crown } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { summary, alerts, project_health: projects, isLoading, error, refresh } = useDashboard();
  const { isPro, isLoading: isSubscriptionLoading } = useProStatus();
  const { projectsRemaining, clientsRemaining, canCreateProject, canCreateClient } = useFeatureGate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  // Calculate real total out-of-scope
  const realTotalOutOfScope = projects.reduce(
    (sum, p) => sum + (p.out_of_scope_requests ?? 0),
    0
  );

  const projectOutOfScopeMap = new Map(
    projects.map((p) => [p.project_id, p.out_of_scope_requests ?? 0])
  );

  const validAlerts = alerts.filter((alert) => {
    if (alert.message.toLowerCase().includes('out-of-scope')) {
      const outOfScopeCount = projectOutOfScopeMap.get(alert.project_id);
      return outOfScopeCount !== undefined && outOfScopeCount > 0;
    }
    return true;
  });

  const revenueProtected = summary?.revenue_protected ?? summary?.total_revenue_protected ?? 0;
  const proposalsAccepted = summary?.proposals_accepted ?? summary?.accepted_proposals ?? 0;
  const totalProposals = summary?.total_proposals ?? 0;
  const completedScopeItems = summary?.completed_scope_items ?? 
    projects.reduce((sum, p) => sum + (p.scope_items_completed ?? 0), 0);
  
  // Calculate acceptance rate safely
  const acceptanceRate = totalProposals > 0 
    ? Math.round((proposalsAccepted / totalProposals) * 100)
    : 0;

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] max-w-7xl mx-auto">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load dashboard</h2>
        <p className="text-slate-500 mb-6">Please try again or contact support if the problem persists.</p>
        <Button variant="outline" onClick={() => refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in max-w-7xl mx-auto px-4 lg:px-0">
      {/* Usage Summary for Free Users */}
      {!isPro && !isSubscriptionLoading && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 lg:p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs lg:text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{projectsRemaining}</span> projects and{' '}
                <span className="font-semibold text-slate-900">{clientsRemaining}</span> clients remaining on Free plan
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate('/settings/billing')}
              className="w-full sm:w-auto"
            >
              <Crown className="w-3 h-3 mr-1" />
              Upgrade
            </Button>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-slate-200 pb-4 lg:pb-6">
        <div>
          <p className="text-xs lg:text-sm font-medium text-slate-500 mb-1">{currentDate}</p>
          <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {firstName}
            </h1>
            {!isSubscriptionLoading && isPro && (
              <ProBadge size="md" variant="gradient" />
            )}
          </div>
          <p className="text-sm lg:text-base text-slate-600 mt-2 max-w-2xl">
            You have <span className="font-semibold text-indigo-600">{summary?.active_projects ?? 0} active projects</span> and <span className="font-semibold text-emerald-600">{realTotalOutOfScope} potential scope items</span> to review.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => navigate('/clients')}
            className="w-full sm:w-auto text-sm"
          >
            Manage Clients
          </Button>
          <Button
            onClick={() => navigate('/projects/new')}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shadow-lg shadow-indigo-500/20 w-full sm:w-auto text-sm"
          >
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-5">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-32 animate-pulse bg-slate-50 border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-24 mb-3" />
              <div className="h-8 bg-slate-200 rounded w-20 mb-2" />
            </Card>
          ))
        ) : (
          <>
            {/* Hero Metric: Revenue */}
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-4 lg:p-5 text-white shadow-lg shadow-indigo-500/20 transform transition-all hover:scale-[1.01] col-span-2 lg:col-span-1">
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-indigo-100 text-xs lg:text-sm font-medium mb-1">
                  <DollarSign className="w-3 h-3 lg:w-4 lg:h-4" />
                  <span>Revenue Protected</span>
                  {!isPro && (
                    <span className="ml-auto hidden lg:inline">
                      <ProFeatureBadge className="bg-white/20 text-white border-white/30" />
                    </span>
                  )}
                </div>
                <div className="text-xl lg:text-3xl font-bold mb-1 tracking-tight">
                  {formatCurrency(revenueProtected)}
                </div>
                <div className="text-xs lg:text-sm text-indigo-100/80">
                  Across {proposalsAccepted} accepted proposals
                </div>
              </div>
              <div className="absolute right-0 top-0 p-2 lg:p-4 opacity-10">
                <DollarSign className="w-16 h-16 lg:w-24 lg:h-24" />
              </div>
            </div>

            <StatCard
              title="Active Projects"
              value={summary?.active_projects ?? 0}
              subtitle="Currently in progress"
              icon={<Briefcase className="w-5 h-5" />}
              iconVariant="primary"
            />
            
            <div 
              onClick={() => {
                if (realTotalOutOfScope > 0) {
                  navigate('/projects');
                }
              }}
              className={realTotalOutOfScope > 0 ? 'cursor-pointer' : ''}
            >
              <StatCard
                title="Scope Creep"
                value={realTotalOutOfScope}
                subtitle="Items needing approval"
                icon={<AlertTriangle className="w-5 h-5" />}
                iconVariant="danger"
              />
            </div>

            <StatCard
              title="Acceptance Rate"
              value={`${acceptanceRate}%`}
              subtitle={`${totalProposals} total proposals`}
              icon={<Activity className="w-5 h-5" />}
              iconVariant="success"
            />
          </>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        
        {/* Left Column: Alerts & Projects (2/3 width) */}
        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
          
          {/* Alerts Section (Conditional) */}
          {validAlerts.length > 0 && (
            <div className="bg-orange-50/50 border border-orange-100 rounded-xl overflow-hidden">
              <div className="px-4 lg:px-5 py-3 lg:py-4 border-b border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className="flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-orange-100 ring-2 lg:ring-4 ring-orange-50">
                    <AlertTriangle className="w-3 h-3 lg:w-3.5 lg:h-3.5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-slate-800 text-sm lg:text-base">Action Required</h3>
                </div>
                <span className="text-xs font-medium px-2 lg:px-2.5 py-0.5 lg:py-1 rounded-full bg-orange-100 text-orange-700">
                  {validAlerts.length} items
                </span>
              </div>
              <div className="divide-y divide-orange-100/50">
                {validAlerts.slice(0, 3).map((alert, index) => (
                  <div
                    key={alert.id || `alert-${index}`}
                    className="px-4 lg:px-5 py-2.5 lg:py-3 hover:bg-orange-50 transition-colors cursor-pointer flex items-center justify-between gap-3 lg:gap-4 group"
                    onClick={() => navigate(`/projects/${alert.project_id}`)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 lg:gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-semibold text-slate-700 truncate">{alert.project_name}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300 shrink-0"></span>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{formatRelative(alert.created_at)}</span>
                      </div>
                      <p className="text-xs lg:text-sm text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-orange-300 group-hover:text-orange-500 transition-colors shrink-0" />
                  </div>
                ))}
              </div>
              {validAlerts.length > 3 && (
                <div className="px-4 lg:px-5 py-2.5 lg:py-3 border-t border-orange-100">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/projects')}
                    className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 text-xs lg:text-sm"
                  >
                    View all {validAlerts.length} alerts
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Active Projects List */}
          <Card padding="none" className="overflow-hidden border-slate-200 shadow-sm">
            <div className="px-4 lg:px-6 py-4 lg:py-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white">
              <div>
                <h2 className="font-semibold text-slate-900 text-base lg:text-lg">Project Health</h2>
                <p className="text-xs lg:text-sm text-slate-500 mt-0.5">Overview of progress and scope status</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="text-xs lg:text-sm whitespace-nowrap">
                View All Projects
              </Button>
            </div>
            
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between">
                    <div className="h-12 bg-slate-100 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center bg-slate-50/50">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                  <FolderOpen className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="text-slate-900 font-medium mb-1">No active projects</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  Start tracking your first project to prevent scope creep and protect your revenue.
                </p>
                <Button onClick={() => navigate('/projects/new')}>Create First Project</Button>
              </div>
            ) : (
              <>
                {/* Desktop Table - Hidden on mobile */}
                <div className="hidden lg:block w-full">
                  {/* Custom Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <div className="col-span-5">Project Name</div>
                    <div className="col-span-3 text-center">Status</div>
                    <div className="col-span-2 text-center">Scope Alerts</div>
                    <div className="col-span-2 text-right">Completion</div>
                  </div>

                  <div className="divide-y divide-slate-50">
                    {projects.map((project) => {
                      const progress = project.scope_items_total > 0
                        ? Math.round((project.scope_items_completed / project.scope_items_total) * 100)
                        : 0;
                      const hasIssues = project.out_of_scope_requests > 0;

                      return (
                        <div
                          key={project.project_id}
                          onClick={() => navigate(`/projects/${project.project_id}`)}
                          className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/80 cursor-pointer transition-all group"
                        >
                          <div className="col-span-5 pr-4">
                            <p className="font-medium text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                              {project.project_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">
                                {project.scope_items_total} deliverables
                              </span>
                            </div>
                          </div>

                          <div className="col-span-3 flex justify-center">
                            <Badge variant={project.status === 'active' ? 'success' : 'default'} size="sm">
                              {project.status === 'active' ? 'Active' : project.status === 'completed' ? 'Completed' : project.status === 'on_hold' ? 'On Hold' : 'Cancelled'}
                            </Badge>
                          </div>

                          <div className="col-span-2 flex justify-center">
                            {hasIssues ? (
                              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100">
                                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                                <span className="text-xs font-semibold text-red-700">
                                  {project.out_of_scope_requests}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-300">
                                <CheckCircle2 className="w-4 h-4" />
                              </span>
                            )}
                          </div>

                          <div className="col-span-2 text-right">
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-sm font-semibold text-slate-700">{progress}%</span>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                  }`}
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Card Layout - Visible only on mobile */}
                <div className="lg:hidden space-y-3 p-4">
                  {projects.map((project) => {
                    const progress = project.scope_items_total > 0
                      ? Math.round((project.scope_items_completed / project.scope_items_total) * 100)
                      : 0;
                    const hasIssues = project.out_of_scope_requests > 0;

                    return (
                      <div
                        key={project.project_id}
                        onClick={() => navigate(`/projects/${project.project_id}`)}
                        className="bg-slate-50 rounded-xl p-4 border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-slate-900 truncate">{project.project_name}</h3>
                            <p className="text-xs text-slate-500 mt-0.5">{project.scope_items_total} deliverables</p>
                          </div>
                          <Badge variant={project.status === 'active' ? 'success' : 'default'} size="sm" className="ml-2 shrink-0">
                            {project.status === 'active' ? 'Active' : project.status === 'completed' ? 'Completed' : project.status === 'on_hold' ? 'On Hold' : 'Cancelled'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <p className="text-xs text-slate-500 mb-0.5">Alerts</p>
                              {hasIssues ? (
                                <div className="flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-red-600" />
                                  <span className="text-sm font-semibold text-red-700">
                                    {project.out_of_scope_requests}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center justify-center">
                                  <CheckCircle2 className="w-4 h-4 text-slate-300" />
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-600 min-w-[35px] text-right">{progress}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Right Column: Summary & Tools (1/3 width) */}
        <div className="space-y-4 lg:space-y-6">
          
          {/* Monthly Performance */}
          <Card className="border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 leading-tight text-sm lg:text-base">Monthly Recap</h3>
                <p className="text-xs text-slate-500">Performance metrics</p>
              </div>
            </div>
            
            {isLoading ? (
              <div className="space-y-4 lg:space-y-5 animate-pulse">
                <div className="h-12 lg:h-16 bg-slate-100 rounded" />
                <div className="h-12 lg:h-16 bg-slate-100 rounded" />
                <div className="h-16 lg:h-20 bg-slate-100 rounded" />
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-5">
                <div className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs lg:text-sm font-medium text-slate-600">Proposals Sent</span>
                    <span className="text-xs lg:text-sm font-bold text-slate-900">{totalProposals}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                     {/* Decorative bar since we don't have a max value for proposals, just show activity */}
                    <div className="h-full bg-indigo-200 rounded-full w-2/3" />
                  </div>
                </div>

                <div className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs lg:text-sm font-medium text-slate-600">Acceptance Rate</span>
                    <span className="text-xs lg:text-sm font-bold text-emerald-600">
                      {acceptanceRate}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all" 
                      style={{ width: `${acceptanceRate}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 lg:pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Delivered</p>
                      <p className="text-base lg:text-lg font-bold text-slate-900 mt-1">{completedScopeItems}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Pending Review</p>
                      <p className="text-base lg:text-lg font-bold text-amber-600 mt-1">{summary?.pending_requests ?? 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Actions Panel */}
          <div className="bg-slate-900 rounded-xl p-4 lg:p-5 text-white shadow-xl shadow-slate-900/10">
            <h3 className="font-semibold mb-3 lg:mb-4 text-slate-100 text-sm lg:text-base">Quick Actions</h3>
            <div className="space-y-2 lg:space-y-3">
              <button
                onClick={() => {
                  if (!canCreateProject) {
                    navigate('/settings/billing');
                  } else {
                    navigate('/projects/new');
                  }
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors group border ${
                  canCreateProject
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                    : 'bg-slate-800/50 border-amber-500/30 opacity-75'
                }`}
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shrink-0 ${
                    canCreateProject
                      ? 'bg-indigo-500/20 text-indigo-400 group-hover:text-indigo-300'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {canCreateProject ? (
                      <Plus className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    ) : (
                      <Crown className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-xs lg:text-sm font-medium truncate ${
                      canCreateProject
                        ? 'text-slate-200 group-hover:text-white'
                        : 'text-amber-200'
                    }`}>
                      {canCreateProject ? 'New Project' : 'Upgrade for More Projects'}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className={`w-3.5 h-3.5 lg:w-4 lg:h-4 transition-colors shrink-0 ${
                  canCreateProject
                    ? 'text-slate-500 group-hover:text-white'
                    : 'text-amber-500/50'
                }`} />
              </button>

              <button
                onClick={() => {
                  if (!canCreateClient) {
                    navigate('/settings/billing');
                  } else {
                    navigate('/clients');
                  }
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors group border ${
                  canCreateClient
                    ? 'bg-slate-800 hover:bg-slate-700 border-slate-700'
                    : 'bg-slate-800/50 border-amber-500/30 opacity-75'
                }`}
              >
                <div className="flex items-center gap-2 lg:gap-3">
                  <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center shrink-0 ${
                    canCreateClient
                      ? 'bg-emerald-500/20 text-emerald-400 group-hover:text-emerald-300'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {canCreateClient ? (
                      <Briefcase className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    ) : (
                      <Crown className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                    )}
                  </div>
                  <div className="text-left min-w-0">
                    <p className={`text-xs lg:text-sm font-medium truncate ${
                      canCreateClient
                        ? 'text-slate-200 group-hover:text-white'
                        : 'text-amber-200'
                    }`}>
                      {canCreateClient ? 'Add Client' : 'Upgrade for More Clients'}
                    </p>
                  </div>
                </div>
                <ArrowUpRight className={`w-3.5 h-3.5 lg:w-4 lg:h-4 transition-colors shrink-0 ${
                  canCreateClient
                    ? 'text-slate-500 group-hover:text-white'
                    : 'text-amber-500/50'
                }`} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;