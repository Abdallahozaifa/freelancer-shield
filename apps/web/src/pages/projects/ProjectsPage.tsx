import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronRight, MoreHorizontal, Trash2, Edit, Users, DollarSign, Clock } from 'lucide-react';
import { Button, Dropdown, EmptyState, ConfirmDialog } from '../../components/ui';
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

// Status colors updated for slightly stronger contrast and clarity
const statusColors: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  completed: { bg: 'bg-slate-100', text: 'text-slate-700', dot: 'bg-slate-500' },
  on_hold: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
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
    // Card styling enhanced with bolder shadow and cleaner border
    <div 
      className="bg-white rounded-xl shadow-md border border-slate-100 p-6 hover:shadow-lg hover:border-indigo-200 hover:-translate-y-0.5 transition-all cursor-pointer group flex flex-col"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 flex-grow-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Project Name - Bolder and slightly larger */}
            <h3 className="font-extrabold text-xl text-slate-900 truncate">{project.name}</h3>
          </div>
          {/* Client Name - Icon added and text made slightly lighter */}
          <p className="text-sm text-slate-500 flex items-center gap-1.5 truncate">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            {project.client_name || 'No Client'}
          </p>
        </div>
        
        {/* More menu - Styling and visibility improved */}
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ml-2">
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
      
      {/* Status Badge - Moved below header for better flow */}
      <span className={cn(
        'px-2.5 py-1 text-sm font-semibold rounded-full whitespace-nowrap inline-flex items-center gap-2 self-start mb-4',
        statusStyle.bg,
        statusStyle.text
      )}>
        <div className={cn('w-2 h-2 rounded-full', statusStyle.dot)} />
        {statusLabels[project.status]}
      </span>


      {/* Progress Bar - Improved visual design */}
      <div className="mb-4 flex-grow">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-600 font-medium">Progress</span>
          <span className="font-bold text-indigo-600">{scopePercent}%</span>
        </div>
        <div className="h-2 bg-indigo-50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all shadow-indigo-400/50"
            style={{ width: `${scopePercent}%` }}
          />
        </div>
      </div>

      {/* Stats - Consolidated into a cleaner block */}
      <div className="flex justify-between text-sm text-slate-500 pt-3 border-t border-slate-100 flex-grow-0">
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-4 h-4 text-emerald-500" />
          {project.budget ? (
            <span className="font-semibold text-slate-700">{formatCurrency(project.budget)}</span>
          ) : (
            <span className="font-medium text-slate-600">No Budget</span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-slate-400" />
          <span>{formatRelative(project.updated_at)}</span>
        </div>
      </div>
      
      {/* Footer - Removed explicit ChevronRight, replaced with subtle border/shadow effect on hover */}
    </div>
  );
};

// Skeleton Card
const ProjectCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-md border border-slate-100 p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="h-6 w-48 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-32 bg-slate-100 rounded-full" />
      </div>
    </div>
    <div className="h-4 w-24 bg-slate-100 rounded-full mb-4" />
    <div className="mb-4">
      <div className="h-4 w-full bg-slate-100 rounded mb-2" />
      <div className="h-2 w-full bg-indigo-100 rounded-full" />
    </div>
    <div className="flex justify-between text-sm pt-3 border-t border-slate-100">
      <div className="h-4 w-20 bg-slate-200 rounded" />
      <div className="h-4 w-20 bg-slate-200 rounded" />
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
        <h1 className="text-3xl font-extrabold text-slate-900">Projects</h1>
        <Button onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Status Tabs - Switched to a cleaner pill-style tab group */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={cn(
                'px-4 py-1.5 text-sm font-semibold rounded-full transition-all whitespace-nowrap',
                activeFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Client Filter - Increased border radius and improved focus ring */}
        <div className="sm:ml-auto">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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