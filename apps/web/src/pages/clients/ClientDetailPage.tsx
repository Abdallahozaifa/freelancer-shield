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
  ChevronRight,
  Plus,
} from 'lucide-react';
import { useClient } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import {
  Button,
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Loading,
  EmptyState,
  Badge,
  Skeleton,
} from '../../components/ui';
import { formatDate } from '../../utils/format';
import { ClientFormModal } from './ClientFormModal';
import { DeleteClientModal } from './DeleteClientModal';
import type { ProjectStatus } from '../../types';

const statusVariants: Record<ProjectStatus, 'success' | 'default' | 'warning' | 'danger'> = {
  active: 'success',
  completed: 'default',
  on_hold: 'warning',
  cancelled: 'danger',
};

const statusLabels: Record<ProjectStatus, string> = {
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
};

export const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: client, isLoading, error } = useClient(id!);
  const { data: projectsData, isLoading: projectsLoading } = useProjects(id);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const projects = projectsData?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading text="Loading client..." />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Clients
        </button>
        <EmptyState
          title="Client not found"
          description="The client you're looking for doesn't exist or has been deleted."
          action={{
            label: 'Go to Clients',
            onClick: () => navigate('/clients'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        onClick={() => navigate('/clients')}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Clients
      </button>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
          {client.company && (
            <p className="mt-1 text-gray-500 flex items-center gap-1">
              <Building2 className="h-4 w-4" />
              {client.company}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            leftIcon={<Pencil className="h-4 w-4" />}
            onClick={() => setIsEditModalOpen(true)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            leftIcon={<Trash2 className="h-4 w-4" />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {client.email && (
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <a
                    href={`mailto:${client.email}`}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {client.email}
                  </a>
                </div>
              </div>
            )}

            {client.company && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Company</p>
                  <p className="text-sm text-gray-900">{client.company}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <FolderOpen className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Projects</p>
                <p className="text-sm text-gray-900">{client.project_count} project(s)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Client Since</p>
                <p className="text-sm text-gray-900">{formatDate(client.created_at)}</p>
              </div>
            </div>

            {client.notes && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Notes</p>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects Section - Clean Table */}
        <Card className="lg:col-span-2" padding="none">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => navigate(`/projects/new?client=${client.id}`)}
            >
              New Project
            </Button>
          </div>

          {projectsLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={<FolderOpen className="h-6 w-6" />}
                title="No projects yet"
                description="Create a project to start tracking scope."
                action={{
                  label: 'Create Project',
                  onClick: () => navigate(`/projects/new?client=${client.id}`),
                }}
              />
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
                <div className="col-span-5">Project</div>
                <div className="col-span-2 text-center">Status</div>
                <div className="col-span-2 text-center">Scope Creep</div>
                <div className="col-span-2 text-center">Progress</div>
                <div className="col-span-1"></div>
              </div>
              
              {/* Project Rows */}
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors items-center"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="col-span-5">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </p>
                  </div>
                  <div className="col-span-2 text-center">
                    <Badge variant={statusVariants[project.status]} size="sm">
                      {statusLabels[project.status]}
                    </Badge>
                  </div>
                  <div className="col-span-2 text-center">
                    {project.out_of_scope_request_count > 0 ? (
                      <span className="text-sm font-medium text-red-600">
                        {project.out_of_scope_request_count}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">0</span>
                    )}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-sm text-gray-600">
                      {project.completed_scope_count}/{project.scope_item_count}
                    </span>
                  </div>
                  <div className="col-span-1 text-right">
                    <ChevronRight className="w-4 h-4 text-gray-400 inline-block" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Edit Modal */}
      <ClientFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        client={client}
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
