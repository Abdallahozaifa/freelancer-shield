import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { Button, Dropdown, Skeleton, EmptyState, ConfirmDialog } from '../../components/ui';
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
  active: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  completed: { bg: 'bg-slate-100', text: 'text-slate-700' },
  on_hold: { bg: 'bg-amber-100', text: 'text-amber-700' },
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

  return (
    <div 
      className="bg-white rounded-2xl border border-slate-200/60 p-5 hover:shadow-lg hover:border-slate-300/60 hover:-translate-y-0.5 transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
            <span className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap',
              statusStyle.bg,
              statusStyle.text
            )}>
              {statusLabels[project.status]}
            </span>
          </div>
          <p className="text-sm text-slate-500 truncate">{project.client_name || '—'}</p>
        </div>
        
        {/* More menu */}
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                <MoreHorizontal className="w-4 h-4" />
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

      {/* Progress Bar - Simple single color */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600">Progress</span>
          <span className="font-medium text-slate-900">{scopePercent}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all"
            style={{ width: `${scopePercent}%` }}
          />
        </div>
      </div>

      {/* Stats - Just scope items, no unreliable out-of-scope count */}
      <div className="text-sm text-slate-600 mb-4">
        {project.scope_item_count > 0 ? (
          <span>{project.completed_scope_count} of {project.scope_item_count} items complete</span>
        ) : (
          <span className="text-slate-400">No scope items yet</span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-sm text-slate-500">
          {project.budget ? (
            <span className="font-medium text-slate-700">{formatCurrency(project.budget)}</span>
          ) : (
            <span>{formatRelative(project.updated_at)}</span>
          )}
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
      </div>
    </div>
  );
};

// Skeleton Card
const ProjectCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-slate-200/60 p-5 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
        </div>
        <div className="h-4 w-24 bg-slate-100 rounded" />
      </div>
    </div>
    <div className="mb-4">
      <div className="h-4 w-full bg-slate-100 rounded mb-2" />
      <div className="h-2 w-full bg-slate-100 rounded-full" />
    </div>
    <div className="h-4 w-32 bg-slate-100 rounded mb-4" />
    <div className="pt-4 border-t border-slate-100">
      <div className="h-4 w-28 bg-slate-100 rounded" />
    </div>
  </div>
);

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('active');
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

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

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      await deleteProject.mutateAsync(projectToDelete.id);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                activeFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
            className="px-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
              onDelete={() => setProjectToDelete(project)}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This will also delete all scope items, requests, and proposals associated with this project. This action cannot be undone.`}
        confirmText="Delete Project"
        variant="danger"
        isLoading={deleteProject.isPending}
      />
    </div>
  );
};

export default ProjectsPage;
