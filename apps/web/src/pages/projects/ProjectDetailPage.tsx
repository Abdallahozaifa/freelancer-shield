import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Target,
  FileText,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Button, Tabs, Dropdown, Skeleton } from '../../components/ui';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useProject, useDeleteProject, projectKeys } from '../../hooks/useProjects';
import { useScopeProgress } from '../../hooks/useScope';
import { useRequestStats } from '../../hooks/useRequests';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProjectFormModal } from './ProjectFormModal';
import { ScopeTab } from './scope';
import { RequestsTab } from './requests';
import { ProposalsTab } from './proposals';
import { cn } from '../../utils/cn';
import { formatCurrency, formatRelative } from '../../utils/format';
import type { Project } from '../../types';

type TabId = 'overview' | 'scope' | 'requests' | 'proposals';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'scope', label: 'Scope' },
  { id: 'requests', label: 'Requests' },
  { id: 'proposals', label: 'Proposals' },
];

const isValidTab = (tab: string | null): tab is TabId => {
  return tab !== null && ['overview', 'scope', 'requests', 'proposals'].includes(tab);
};

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const tabParam = searchParams.get('tab');
  const initialTab = isValidTab(tabParam) ? tabParam : 'overview';
  
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { data: project, isLoading, error } = useProject(id!);
  const deleteProject = useDeleteProject();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (isValidTab(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: string) => {
    const newTab = tabId as TabId;
    setActiveTab(newTab);
    
    if (newTab === 'overview') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', newTab);
    }
    setSearchParams(searchParams, { replace: true });
    
    if (tabId === 'overview' && id) {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    
    try {
      await deleteProject.mutateAsync(project.id);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load project.</p>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          to="/projects"
          className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-slate-500">
              {project.client_name}
              {project.description && ` • ${project.description}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit
            </Button>
            <Dropdown
              trigger={
                <Button variant="ghost">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
              items={[
                {
                  label: 'Delete Project',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: () => setIsDeleteDialogOpen(true),
                  danger: true,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={handleTabChange}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab project={project} />}
      {activeTab === 'scope' && <ScopeTab projectId={project.id} />}
      {activeTab === 'requests' && <RequestsTab projectId={project.id} />}
      {activeTab === 'proposals' && <ProposalsTab projectId={project.id} />}

      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This will also delete all scope items, requests, and proposals. This action cannot be undone.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteProject.isPending}
      />
    </div>
  );
};

// Helper to format hours
const formatHours = (hours: number | null | undefined): string => {
  if (hours === null || hours === undefined) return '0';
  const num = Number(hours);
  if (isNaN(num)) return '0';
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
};

// Simplified Overview Tab
interface OverviewTabProps {
  project: Project;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ project }) => {
  const { data: scopeProgress } = useScopeProgress(project.id);
  const { stats: requestStats } = useRequestStats(project.id);
  const navigate = useNavigate();

  const scopeProgressPercent = project.scope_item_count > 0
    ? Math.round((project.completed_scope_count / project.scope_item_count) * 100)
    : 0;

  const scopedHours = scopeProgress?.total_estimated_hours ?? 0;
  const completedHours = scopeProgress?.completed_estimated_hours ?? 0;
  const hoursPercent = scopedHours > 0 ? Math.round((completedHours / scopedHours) * 100) : 0;

  // Use actual count from requests, not stale project field
  const outOfScopeCount = requestStats.outOfScope;
  const hasOutOfScope = outOfScopeCount > 0;

  return (
    <div className="space-y-6">
      {/* Alert Banner - Only show if scope creep exists */}
      {hasOutOfScope && (
        <div className="flex items-center gap-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-red-900">
              {outOfScopeCount} out-of-scope request{outOfScopeCount !== 1 ? 's' : ''} detected
            </p>
            <p className="text-sm text-red-600">
              Review and create proposals to protect your revenue
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/projects/${project.id}?tab=requests`)}
          >
            Review Requests
          </Button>
        </div>
      )}

      {/* Two Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Budget & Hours Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Budget</h3>
              <p className="text-2xl font-bold text-slate-900">
                {project.budget ? formatCurrency(project.budget) : '—'}
                {project.hourly_rate && (
                  <span className="text-sm font-normal text-slate-400 ml-2">
                    ({formatCurrency(project.hourly_rate)}/hr)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Hours Progress */}
          {scopedHours > 0 && (
            <div className="pt-4 border-t border-slate-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Hours</span>
                <span className="font-medium text-slate-900">
                  {formatHours(completedHours)}h / {formatHours(scopedHours)}h
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${hoursPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1 text-right">{hoursPercent}% complete</p>
            </div>
          )}
        </Card>

        {/* Progress Card */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Progress</h3>
              <p className="text-2xl font-bold text-slate-900">
                {scopeProgressPercent}%
                <span className="text-sm font-normal text-slate-400 ml-2">
                  ({project.completed_scope_count}/{project.scope_item_count} items)
                </span>
              </p>
            </div>
          </div>

          {/* Scope Progress Bar */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600">Scope Items</span>
              <span className="font-medium text-slate-900">
                {project.completed_scope_count} of {project.scope_item_count}
              </span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                style={{ width: `${scopeProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                {project.completed_scope_count} done
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />
                {project.scope_item_count - project.completed_scope_count} remaining
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => navigate(`/projects/${project.id}?tab=scope`)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
              <Plus className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900">Add Scope Item</p>
              <p className="text-xs text-slate-400">Define project deliverables</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => navigate(`/projects/${project.id}?tab=requests`)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left group",
              hasOutOfScope 
                ? "bg-red-50 hover:bg-red-100" 
                : "bg-slate-50 hover:bg-slate-100"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-xl transition-colors",
              hasOutOfScope 
                ? "bg-red-100 group-hover:bg-red-200" 
                : "bg-amber-100 group-hover:bg-amber-200"
            )}>
              <AlertTriangle className={cn(
                "w-5 h-5",
                hasOutOfScope ? "text-red-600" : "text-amber-600"
              )} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900">Review Requests</p>
              {hasOutOfScope ? (
                <p className="text-xs text-red-600 font-medium">
                  {outOfScopeCount} need attention
                </p>
              ) : (
                <p className="text-xs text-slate-400">Analyze client requests</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => navigate(`/projects/${project.id}?tab=proposals`)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 group-hover:bg-emerald-200 transition-colors">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900">Create Proposal</p>
              <p className="text-xs text-slate-400">Bill for extra work</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </Card>

      {/* Project Details - Compact */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Project Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500 mb-1">Client</p>
            <p className="font-medium text-slate-900">{project.client_name}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Status</p>
            <ProjectStatusBadge status={project.status} />
          </div>
          <div>
            <p className="text-slate-500 mb-1">Created</p>
            <p className="font-medium text-slate-900">{formatRelative(project.created_at)}</p>
          </div>
          <div>
            <p className="text-slate-500 mb-1">Updated</p>
            <p className="font-medium text-slate-900">{formatRelative(project.updated_at)}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Loading Skeleton
const ProjectDetailSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="flex items-start justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    </div>
    <Skeleton className="h-10 w-96" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
    </div>
  </div>
);

export default ProjectDetailPage;
