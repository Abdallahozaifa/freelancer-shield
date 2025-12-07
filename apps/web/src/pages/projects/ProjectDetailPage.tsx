import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  DollarSign,
  Target,
  FileText,
  Plus,
  Briefcase,
  PieChart
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, Button, Tabs, Dropdown, useToast } from '../../components/ui';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useProject, useDeleteProject, projectKeys } from '../../hooks/useProjects';
import { useScopeProgress } from '../../hooks/useScope';
import { useRequestStats } from '../../hooks/useRequests';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProjectFormModal } from './ProjectFormModal';
import { ScopeTab } from './scope';
import { RequestsTab } from './requests';
import { ProposalsTab } from './proposals';
import { formatCurrency, formatRelative } from '../../utils/format';
import type { Project } from '../../types';

type TabId = 'overview' | 'scope' | 'requests' | 'proposals';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'scope', label: 'Scope Definition' },
  { id: 'requests', label: 'Client Requests' },
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
  const toast = useToast();

  const { data: project, isLoading, error } = useProject(id!);
  const deleteProject = useDeleteProject();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (isValidTab(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    } else if (!isValidTab(tabParam) && activeTab !== 'overview') {
      // Fallback to overview if invalid tab param
      setActiveTab('overview');
    }
  }, [searchParams, activeTab]);

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
      toast.success('Project deleted successfully');
      navigate('/projects');
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  if (isLoading) {
    return <ProjectDetailSkeleton />;
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Failed to load project</h2>
        <Button variant="outline" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Navigation */}
      <div>
        <Link
          to="/projects"
          className="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Projects
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <ProjectStatusBadge status={project.status} />
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {project.client_name}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
              {project.name}
            </h1>
            
            {project.description && (
              <p className="text-slate-600 text-lg leading-relaxed max-w-3xl break-words">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit className="w-4 h-4" />}
              className="bg-white"
            >
              Edit Details
            </Button>
            <Dropdown
              trigger={
                <Button variant="outline" className="px-3 bg-white">
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
              align="right"
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 border-b border-slate-100">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={handleTabChange}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && <OverviewTab project={project} />}
        {activeTab === 'scope' && <ScopeTab projectId={project.id} />}
        {activeTab === 'requests' && <RequestsTab projectId={project.id} />}
        {activeTab === 'proposals' && <ProposalsTab projectId={project.id} />}
      </div>

      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
        onSuccess={() => {
          toast.success('Project updated successfully');
          queryClient.invalidateQueries({ queryKey: projectKeys.detail(id!) });
        }}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? This will permanently remove all associated scope items, requests, and proposals.`}
        confirmText="Delete Project"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteProject.isPending}
      />
    </div>
  );
};

// Helper
const formatHours = (hours: number | null | undefined): string => {
  if (hours === null || hours === undefined) return '0';
  const num = Number(hours);
  return num % 1 === 0 ? num.toFixed(0) : num.toFixed(1);
};

// Overview Component
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

  const outOfScopeCount = requestStats.outOfScope;
  const hasOutOfScope = outOfScopeCount > 0;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Alert Banner */}
      {hasOutOfScope && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-red-900">Scope Creep Detected</h3>
              <p className="text-red-700 text-sm mt-1">
                You have {outOfScopeCount} request{outOfScopeCount !== 1 ? 's' : ''} flagged as out-of-scope. Review them to update your proposal.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate(`/projects/${project.id}?tab=requests`)}
            className="bg-red-600 hover:bg-red-700 text-white border-none shadow-none w-full md:w-auto"
          >
            Review Requests
          </Button>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Budget Card */}
        <Card className="p-6 border-slate-200 shadow-sm relative overflow-hidden group hover:border-slate-300 transition-colors">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <DollarSign className="w-24 h-24" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700">Budget</span>
            </div>
            <div className="mb-2">
              <span className="text-3xl font-bold text-slate-900">
                {project.budget ? formatCurrency(project.budget) : '—'}
              </span>
            </div>
            {project.hourly_rate && (
              <div className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-600">
                {formatCurrency(project.hourly_rate)} / hr
              </div>
            )}
          </div>
        </Card>

        {/* Hours Card */}
        <Card className="p-6 border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700">Time Tracking</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{hoursPercent}%</span>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Consumed</span>
              <span className="font-medium text-slate-900">{formatHours(completedHours)} hrs</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${hoursPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>0 hrs</span>
              <span>{formatHours(scopedHours)} hrs total</span>
            </div>
          </div>
        </Card>

        {/* Scope Progress Card */}
        <Card className="p-6 border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700">Deliverables</span>
            </div>
            <span className="text-2xl font-bold text-slate-900">{scopeProgressPercent}%</span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Completed Items</span>
              <span className="font-medium text-slate-900">
                {project.completed_scope_count} / {project.scope_item_count}
              </span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${scopeProgressPercent}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{project.scope_item_count - project.completed_scope_count} remaining items</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-slate-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-slate-400" />
            <h3 className="font-bold text-slate-900">Management Actions</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(`/projects/${project.id}?tab=scope`)}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-md transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 group-hover:text-indigo-700">Add Deliverable</h4>
                <p className="text-sm text-slate-500 mt-1">Define new scope items or tasks for this project.</p>
              </div>
            </button>

            <button
              onClick={() => navigate(`/projects/${project.id}?tab=proposals`)}
              className="flex items-start gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md transition-all group text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 group-hover:text-emerald-700">Generate Proposal</h4>
                <p className="text-sm text-slate-500 mt-1">Create a professional proposal for new work.</p>
              </div>
            </button>
          </div>
        </Card>

        {/* Meta Details Sidebar */}
        <Card className="border-slate-200 shadow-sm p-6 bg-slate-50/50">
           <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wide">Project Metadata</h3>
           <div className="space-y-4">
             <div>
               <p className="text-xs font-semibold text-slate-500 uppercase">Created</p>
               <p className="text-sm font-medium text-slate-900 mt-1">{formatRelative(project.created_at)}</p>
             </div>
             <div>
               <p className="text-xs font-semibold text-slate-500 uppercase">Last Updated</p>
               <p className="text-sm font-medium text-slate-900 mt-1">{formatRelative(project.updated_at)}</p>
             </div>
             <div>
               <p className="text-xs font-semibold text-slate-500 uppercase">Client Contact</p>
               <Link to={`/clients/${project.client_id}`} className="text-sm font-medium text-indigo-600 hover:underline mt-1 block">
                 View Client Profile →
               </Link>
             </div>
           </div>
        </Card>
      </div>
    </div>
  );
};

const ProjectDetailSkeleton: React.FC = () => (
  <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
    <div className="h-64 bg-slate-100 rounded-2xl" />
    <div className="grid grid-cols-3 gap-6">
      <div className="h-40 bg-slate-100 rounded-xl" />
      <div className="h-40 bg-slate-100 rounded-xl" />
      <div className="h-40 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

export default ProjectDetailPage;