import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Button, Dropdown, Skeleton, EmptyState } from '../../components/ui';
import { useProjects, useDeleteProject } from '../../hooks/useProjects';
import { useClients } from '../../hooks/useClients';
import { ProjectFormModal } from './ProjectFormModal';
import { cn } from '../../utils/cn';
import { formatCurrency, formatRelative } from '../../utils/format';
import type { Project, ProjectStatus } from '../../types';

type FilterTab = 'all' | 'active' | 'completed' | 'on_hold';

const filterTabs: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'on_hold', label: 'On Hold' },
];

const statusColors: Record<ProjectStatus, { bg: string; text: string }> = {
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-700' },
  on_hold: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
};

const statusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

// Project Card Component
interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onEdit, onDelete }) => {
  const statusStyle = statusColors[project.status] || statusColors.active;
  
  const scopePercent = project.scope_item_count > 0
    ? Math.round((project.completed_scope_count / project.scope_item_count) * 100)
    : 0;

  // Calculate scope creep percentage (out of scope vs total scope items)
  const creepPercent = project.scope_item_count > 0
    ? Math.round((project.out_of_scope_request_count / project.scope_item_count) * 100)
    : 0;

  return (
    <div 
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 truncate">{project.name}</h3>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              statusStyle.bg,
              statusStyle.text
            )}>
              {statusLabels[project.status]}
            </span>
          </div>
          <p className="text-sm text-gray-500">Client: {project.client_name || '—'}</p>
        </div>
        
        {/* More menu */}
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            }
            items={[
              {
                label: 'Edit',
                icon: <Edit className="w-4 h-4" />,
                onClick: onEdit,
              },
              {
                label: 'Delete',
                icon: <Trash2 className="w-4 h-4" />,
                onClick: onDelete,
                danger: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Scope Progress */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Scope: {scopePercent}%</span>
          <span className="text-gray-400">{creepPercent}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-green-500 transition-all"
            style={{ width: `${scopePercent}%` }}
          />
          {creepPercent > 0 && (
            <div 
              className="h-full bg-red-400 transition-all"
              style={{ width: `${Math.min(creepPercent, 100 - scopePercent)}%` }}
            />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-600 mb-3">
        <span>{project.scope_item_count} scope items</span>
        {project.out_of_scope_request_count > 0 && (
          <span className="text-red-500 ml-1">
            • {project.out_of_scope_request_count} out-of-scope
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {project.budget ? (
            <span>Budget: {formatCurrency(project.budget)}</span>
          ) : (
            <span>Last activity {formatRelative(project.updated_at)}</span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>
    </div>
  );
};

// Skeleton Card
const ProjectCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
    <div className="mb-3">
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
    <Skeleton className="h-4 w-32 mb-3" />
    <div className="pt-3 border-t border-gray-100">
      <Skeleton className="h-4 w-28" />
    </div>
  </div>
);

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { data: projectsData, isLoading: projectsLoading } = useProjects();
  const { data: clientsData } = useClients();
  const deleteProject = useDeleteProject();

  const projects = projectsData?.items ?? [];
  const clients = clientsData?.items ?? [];

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Status filter
      if (activeFilter !== 'all' && project.status !== activeFilter) {
        return false;
      }
      // Client filter
      if (selectedClient !== 'all' && project.client_id !== selectedClient) {
        return false;
      }
      return true;
    });
  }, [projects, activeFilter, selectedClient]);

  const handleDelete = async (project: Project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }
    try {
      await deleteProject.mutateAsync(project.id);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-colors',
                activeFilter === tab.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Client Filter */}
        <div className="sm:ml-auto">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Client: All Clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title={activeFilter === 'all' ? 'No projects yet' : `No ${activeFilter.replace('_', ' ')} projects`}
          description={
            activeFilter === 'all'
              ? 'Create your first project to start tracking scope and protecting your revenue.'
              : `You don't have any projects with "${activeFilter.replace('_', ' ')}" status.`
          }
          action={
            activeFilter === 'all'
              ? {
                  label: 'Create Project',
                  onClick: () => setIsCreateModalOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => navigate(`/projects/${project.id}`)}
              onEdit={() => setEditingProject(project)}
              onDelete={() => handleDelete(project)}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <ProjectFormModal
        isOpen={isCreateModalOpen || !!editingProject}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject ?? undefined}
      />
    </div>
  );
};

export default ProjectsPage;
