import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Mail,
  FileText,
  Calendar,
  Pencil,
  Trash2,
  FolderOpen,
  Plus,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { useClient, clientKeys } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  Loading,
  EmptyState,
} from '../../components/ui';
import { formatDate } from '../../utils/format';
import { ClientFormModal } from './ClientFormModal';
import { DeleteClientModal } from './DeleteClientModal';
import type { ProjectStatus } from '../../types';

// Helper for avatar initials
const getInitials = (name: string) => {
  if (!name || name.trim() === '') return '?';
  return name
    .trim()
    .split(' ')
    .filter(n => n.length > 0)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: 'Active', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  completed: { label: 'Completed', className: 'bg-slate-100 text-slate-700 border-slate-200' },
  on_hold: { label: 'On Hold', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' },
};

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: client, isLoading, error, refetch } = useClient(id!);
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ client_id: id });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const projects = projectsData?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loading text="Loading client profile..." />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Clients
        </button>
        <EmptyState
          icon={<Briefcase className="w-12 h-12 text-slate-300" />}
          title="Client not found"
          description="The client you're looking for doesn't exist or has been removed."
          action={{
            label: 'Go to Clients',
            onClick: () => navigate('/clients'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 animate-fade-in pb-8 lg:pb-12 px-4 lg:px-0">
      {/* Navigation */}
      <div>
        <button
          onClick={() => navigate('/clients')}
          className="group inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1" />
          Back to Clients
        </button>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-14 h-14 md:w-20 md:h-20 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg md:text-2xl font-bold shadow-md shrink-0">
              {getInitials(client.name)}
            </div>
            
            {/* Info */}
            <div className="space-y-1">
              <h1 className="text-xl md:text-3xl font-bold text-slate-900">{client.name}</h1>
              <div className="flex items-center flex-wrap gap-2 md:gap-4 text-slate-500 text-xs md:text-sm">
                {client.company && (
                  <span className="flex items-center gap-1 md:gap-1.5 font-medium text-slate-700">
                    <Building2 className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />
                    {client.company}
                  </span>
                )}
                <span className="flex items-center gap-1 md:gap-1.5">
                  <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />
                  Joined {formatDate(client.created_at)}
                </span>
                <span className="flex items-center gap-1 md:gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 md:h-4 md:w-4 text-slate-400" />
                  {client.project_count} Projects
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
            <Button
              variant="outline"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 md:flex-none justify-center"
            >
              Edit
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex-1 md:flex-none justify-center bg-white hover:bg-red-50 text-red-600 border-slate-200 hover:border-red-200"
            >
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Contact & Notes - Takes 1 column */}
        <div className="space-y-6">
          <Card className="border-slate-200 shadow-sm h-full">
            <div className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-400" />
                Contact Details
              </h3>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Email Address</label>
                  {client.email ? (
                    <a href={`mailto:${client.email}`} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors break-all">
                      <Mail className="w-4 h-4 shrink-0" />
                      {client.email}
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">No email provided</span>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Company</label>
                  {client.company ? (
                    <p className="text-slate-900 font-medium">{client.company}</p>
                  ) : (
                    <span className="text-slate-400 italic">No company listed</span>
                  )}
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" />
                    Internal Notes
                  </label>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 leading-relaxed min-h-[100px] border border-slate-100">
                    {client.notes ? (
                      client.notes
                    ) : (
                      <span className="text-slate-400 italic">No notes added for this client yet.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Projects List - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card padding="none" className="border-slate-200 shadow-sm overflow-hidden h-full">
            {/* Projects Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FolderOpen className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-900 text-lg">Projects</h2>
              </div>
              <Button
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => navigate(`/projects/new?client=${client.id}`)}
                className="shadow-sm"
              >
                New Project
              </Button>
            </div>

            {projectsLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between animate-pulse">
                    <div className="h-10 bg-slate-100 rounded w-1/3" />
                    <div className="h-6 bg-slate-100 rounded w-1/4" />
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="p-12 text-center bg-slate-50/30">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-medium mb-1">No projects found</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  Start working with {client.name} by creating a new project to track.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/projects/new?client=${client.id}`)}
                >
                  Create Project
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table - Hidden on mobile */}
                <div className="hidden lg:block divide-y divide-slate-100">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                    <div className="col-span-5">Project Name</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-center">Scope</div>
                    <div className="col-span-3 text-right">Completion</div>
                  </div>
                  
                  {/* Desktop Rows */}
                  {projects.map((project) => {
                    const progress = project.scope_item_count > 0 
                      ? Math.round((project.completed_scope_count / project.scope_item_count) * 100) 
                      : 0;

                    return (
                      <div
                        key={project.id}
                        role="button"
                        tabIndex={0}
                        className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 cursor-pointer transition-all group items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset"
                        onClick={() => navigate(`/projects/${project.id}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/projects/${project.id}`);
                          }
                        }}
                      >
                        <div className="col-span-5 min-w-0">
                          <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {project.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Last updated {formatDate(project.updated_at)}
                          </p>
                        </div>

                        <div className="col-span-2 flex justify-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[project.status].className}`}>
                            {statusConfig[project.status].label}
                          </span>
                        </div>

                        <div className="col-span-2 flex justify-center">
                          {project.out_of_scope_request_count > 0 ? (
                            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100" title="Out of scope requests detected">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span className="text-xs font-bold">{project.out_of_scope_request_count}</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">-</span>
                          )}
                        </div>

                        <div className="col-span-3">
                          <div className="flex flex-col items-end gap-1.5">
                            <span className="text-xs font-medium text-slate-700">{progress}%</span>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
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

                {/* Mobile Card Layout */}
                <div className="lg:hidden divide-y divide-slate-100">
                  {projects.map((project) => {
                    const progress = project.scope_item_count > 0 
                      ? Math.round((project.completed_scope_count / project.scope_item_count) * 100) 
                      : 0;

                    return (
                      <div
                        key={project.id}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="p-4 hover:bg-slate-50 active:bg-slate-100 cursor-pointer transition-colors"
                      >
                        {/* Top: Name + Status */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Updated {formatDate(project.updated_at)}
                            </p>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 ${statusConfig[project.status].className}`}>
                            {statusConfig[project.status].label}
                          </span>
                        </div>

                        {/* Bottom: Scope Alert + Progress */}
                        <div className="flex items-center justify-between">
                          {/* Scope Alerts */}
                          <div>
                            {project.out_of_scope_request_count > 0 ? (
                              <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                <AlertTriangle className="w-3 h-3" />
                                <span className="text-xs font-bold">{project.out_of_scope_request_count} alerts</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400">No scope alerts</span>
                            )}
                          </div>

                          {/* Progress */}
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-slate-700 w-8 text-right">{progress}%</span>
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
      </div>

      {/* Edit Modal */}
      <ClientFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: clientKeys.detail(id!) });
          refetch();
        }}
      />

      {/* Delete Modal */}
      <DeleteClientModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        client={client}
        onDeleted={() => navigate('/clients')}
      />
    </div>
  );
};

export default ClientDetailPage;