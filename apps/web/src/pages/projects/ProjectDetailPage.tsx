import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Trash2,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  FileText,
  ListChecks,
  MessageSquare,
  FileSignature,
} from 'lucide-react';
import { Card, Button, Tabs, Dropdown, Skeleton } from '../../components/ui';
import { useProject, useDeleteProject } from '../../hooks/useProjects';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProjectHealthGauge } from './ProjectHealthGauge';
import { ProjectFormModal } from './ProjectFormModal';
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

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: project, isLoading, error } = useProject(id!);
  const deleteProject = useDeleteProject();

  const handleDelete = async () => {
    if (!project || !window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteProject.mutateAsync(project.id);
      navigate('/projects');
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setIsDeleting(false);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          to="/projects"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-gray-500">
              {project.client_name}
              {project.description && ` • ${project.description}`}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
              items={[
                {
                  label: 'Delete Project',
                  icon: <Trash2 className="w-4 h-4" />,
                  onClick: handleDelete,
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
        onChange={(id) => setActiveTab(id as TabId)}
      />

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab project={project} />}
      {activeTab === 'scope' && <ScopeTabPlaceholder projectId={project.id} />}
      {activeTab === 'requests' && <RequestsTabPlaceholder projectId={project.id} />}
      {activeTab === 'proposals' && <ProposalsTabPlaceholder projectId={project.id} />}

      <ProjectFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        project={project}
      />
    </div>
  );
};

// Overview Tab
interface OverviewTabProps {
  project: Project;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ project }) => {
  const scopeProgress = project.scope_item_count > 0
    ? Math.round((project.completed_scope_count / project.scope_item_count) * 100)
    : 0;

  // Calculate a simple health score based on scope completion and out-of-scope requests
  const outOfScopeRatio = project.scope_item_count > 0 
    ? project.out_of_scope_request_count / project.scope_item_count 
    : 0;
  const healthScore = Math.max(0, Math.min(100, Math.round(
    (scopeProgress * 0.6) + ((1 - outOfScopeRatio) * 40)
  )));

  return (
    <div className="space-y-6">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Health Score */}
        <Card className="p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Health Score</h3>
          <ProjectHealthGauge score={healthScore} size="md" />
        </Card>

        {/* Budget */}
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Budget</h3>
          <p className="text-3xl font-bold text-gray-900">
            {project.budget ? formatCurrency(project.budget) : '—'}
          </p>
          {project.hourly_rate && (
            <p className="text-sm text-gray-500 mt-1">
              {formatCurrency(project.hourly_rate)}/hr
              {project.estimated_hours && ` • ${project.estimated_hours}h estimated`}
            </p>
          )}
        </Card>

        {/* Quick Stats */}
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-gray-900">{project.scope_item_count}</p>
              <p className="text-xs text-gray-500">Scope Items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{project.out_of_scope_request_count}</p>
              <p className="text-xs text-gray-500">Out of Scope</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Scope Progress */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Scope Progress</h3>
          <span className="text-sm font-medium text-gray-600">
            {scopeProgress}% ({project.completed_scope_count}/{project.scope_item_count} items)
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${scopeProgress}%` }}
          />
        </div>
        <div className="flex items-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-gray-600">{project.completed_scope_count} Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-gray-600">{project.scope_item_count - project.completed_scope_count} Remaining</span>
          </div>
        </div>
      </Card>

      {/* Request Breakdown */}
      <Card className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Request Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatBlock
            label="Scope Items"
            value={project.scope_item_count}
            icon={<ListChecks className="w-5 h-5 text-gray-400" />}
          />
          <StatBlock
            label="Completed"
            value={project.completed_scope_count}
            icon={<CheckCircle className="w-5 h-5 text-green-500" />}
            color="text-green-600"
          />
          <StatBlock
            label="Out of Scope"
            value={project.out_of_scope_request_count}
            icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
            color="text-amber-600"
          />
        </div>
      </Card>

      {/* Project Info */}
      <Card className="p-6">
        <h3 className="font-medium text-gray-900 mb-4">Project Details</h3>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Created</dt>
            <dd className="font-medium text-gray-900">{formatRelative(project.created_at)}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Last Updated</dt>
            <dd className="font-medium text-gray-900">{formatRelative(project.updated_at)}</dd>
          </div>
          {project.estimated_hours && (
            <div>
              <dt className="text-gray-500">Estimated Hours</dt>
              <dd className="font-medium text-gray-900">{project.estimated_hours}h</dd>
            </div>
          )}
          {project.hourly_rate && (
            <div>
              <dt className="text-gray-500">Hourly Rate</dt>
              <dd className="font-medium text-gray-900">{formatCurrency(project.hourly_rate)}</dd>
            </div>
          )}
        </dl>
      </Card>
    </div>
  );
};

// Stat Block Component
interface StatBlockProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color?: string;
}

const StatBlock: React.FC<StatBlockProps> = ({ label, value, icon, color }) => (
  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
    {icon}
    <div>
      <p className={cn('text-xl font-bold', color || 'text-gray-900')}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  </div>
);

// Placeholder Tabs (to be implemented in future modules)
const ScopeTabPlaceholder: React.FC<{ projectId: string }> = () => (
  <Card className="p-8 text-center">
    <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto rounded-full bg-gray-100 text-gray-300">
      <ListChecks className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Scope Items</h3>
    <p className="text-gray-500 mb-4">
      Manage your project scope items here. This will be implemented in Module F06.
    </p>
    <Button variant="outline" disabled>
      Coming Soon
    </Button>
  </Card>
);

const RequestsTabPlaceholder: React.FC<{ projectId: string }> = () => (
  <Card className="p-8 text-center">
    <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto rounded-full bg-gray-100 text-gray-300">
      <MessageSquare className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Client Requests</h3>
    <p className="text-gray-500 mb-4">
      Track and analyze client requests here. This will be implemented in Module F07.
    </p>
    <Button variant="outline" disabled>
      Coming Soon
    </Button>
  </Card>
);

const ProposalsTabPlaceholder: React.FC<{ projectId: string }> = () => (
  <Card className="p-8 text-center">
    <div className="flex items-center justify-center w-12 h-12 mb-4 mx-auto rounded-full bg-gray-100 text-gray-300">
      <FileSignature className="w-6 h-6" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Proposals</h3>
    <p className="text-gray-500 mb-4">
      Create and manage proposals here. This will be implemented in Module F08.
    </p>
    <Button variant="outline" disabled>
      Coming Soon
    </Button>
  </Card>
);

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
      <Skeleton className="h-48" />
    </div>
  </div>
);
