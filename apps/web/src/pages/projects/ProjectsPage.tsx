import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FolderOpen, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../../layouts/PageHeader';
import { Card, Button, Select, Tabs, Skeleton, EmptyState } from '../../components/ui';
import { useProjects } from '../../hooks/useProjects';
import { useClients } from '../../hooks/useClients';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { ProjectFormModal } from './ProjectFormModal';
import { cn } from '../../utils/cn';
import { formatCurrency, formatRelative } from '../../utils/format';
import type { Project, ProjectStatus } from '../../types';

type FilterStatus = 'all' | ProjectStatus;

const statusTabs = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'on_hold', label: 'On Hold' },
];

export const ProjectsPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('active');
  const [clientFilter, setClientFilter] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: clientsData } = useClients();
  
  const { data, isLoading, error } = useProjects({
    status: statusFilter === 'all' ? undefined : statusFilter,
    client_id: clientFilter || undefined,
  });

  const clientOptions = [
    { value: '', label: 'All Clients' },
    ...(clientsData?.items?.map((client) => ({
      value: client.id,
      label: client.name,
    })) ?? []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage your freelance projects and track scope"
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs
          tabs={statusTabs}
          activeTab={statusFilter}
          onChange={(id) => setStatusFilter(id as FilterStatus)}
        />
        
        <div className="w-full sm:w-48">
          <Select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            options={clientOptions}
          />
        </div>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center">
          <p className="text-red-600">Failed to load projects. Please try again.</p>
        </Card>
      ) : !data?.items?.length ? (
        <EmptyState
          icon={<FolderOpen className="w-6 h-6" />}
          title="No projects yet"
          description="Create your first project to start tracking scope and managing client requests."
          action={{
            label: 'Create Project',
            onClick: () => setIsModalOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.items.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

// Project Card Component
interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const scopeProgress = project.scope_item_count > 0
    ? Math.round((project.completed_scope_count / project.scope_item_count) * 100)
    : 0;

  const hasOutOfScope = project.out_of_scope_request_count > 0;

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
            {project.name}
          </h3>
          <ProjectStatusBadge status={project.status} size="sm" />
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Client: {project.client_name}
        </p>

        {/* Scope Progress */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Scope</span>
            <span className="font-medium">{scopeProgress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${scopeProgress}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <span>{project.scope_item_count} scope items</span>
          {hasOutOfScope && (
            <span className="flex items-center text-amber-600">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              {project.out_of_scope_request_count} out-of-scope
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          {project.budget ? (
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(project.budget)}
            </span>
          ) : (
            <span className="text-sm text-gray-400">No budget set</span>
          )}
          <span className="text-xs text-gray-400">
            Updated {formatRelative(project.updated_at)}
          </span>
        </div>
      </Card>
    </Link>
  );
};

// Loading Skeleton
const ProjectCardSkeleton: React.FC = () => (
  <Card className="p-4">
    <div className="flex items-start justify-between mb-3">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
    <Skeleton className="h-4 w-24 mb-4" />
    <Skeleton className="h-2 w-full mb-3" />
    <Skeleton className="h-4 w-40 mb-3" />
    <div className="flex justify-between pt-3 border-t border-gray-100">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  </Card>
);
