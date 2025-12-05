import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Users, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import {
  Button,
  Input,
  Table,
  EmptyState,
  Dropdown,
  type Column,
  type DropdownItem,
} from '../../components/ui';
import type { Client } from '../../types';
import { formatDate } from '../../utils/format';
import { ClientFormModal } from './ClientFormModal';
import { DeleteClientModal } from './DeleteClientModal';
import { cn } from '../../utils/cn'; // Ensure cn is available

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useClients();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Extract clients from PaginatedResponse<Client>
  const clients: Client[] = useMemo(() => {
    if (!data || !Array.isArray(data.items)) return [];
    return data.items;
  }, [data]);

  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;

    const query = searchQuery.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.company?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  const handleRowClick = (client: Client) => {
    navigate(`/clients/${client.id}`);
  };

  const getDropdownItems = (client: Client): DropdownItem[] => [
    {
      label: 'Edit',
      icon: <Pencil className="h-4 w-4" />,
      onClick: () => setEditingClient(client),
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: () => setDeletingClient(client),
      danger: true,
    },
  ];

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      // Enhanced name rendering for boldness and color
      render: (client) => (
        <div className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {client.name}
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (client) => (
        <span className="text-slate-600 font-medium">{client.company || '—'}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (client) => (
        <span className="text-slate-600">{client.email || '—'}</span>
      ),
    },
    {
      key: 'project_count',
      header: 'Projects',
      width: '100px',
      // Enhanced badge styling for project count
      render: (client) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 tabular-nums">
          {client.project_count}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (client) => (
        <span className="text-slate-500 text-sm">
          {formatDate(client.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      // Enhanced actions button styling
      render: (client) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            }
            items={getDropdownItems(client)}
            align="right"
          />
        </div>
      ),
    },
  ];

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Clients</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your client relationships
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Client
          </Button>
        </div>
        <Table<Client>
          data={[]}
          columns={columns}
          isLoading={true}
          emptyMessage="Loading clients..."
        />
      </div>
    );
  }

  // Show empty state only when not loading and no clients exist
  const showEmptyState = clients.length === 0 && !searchQuery;

  return (
    <div className="space-y-6">
      {/* Header - Enhanced Typography */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Clients</h1>
          <p className="mt-1 text-base text-slate-500">
            Manage your client relationships and project history.
          </p>
        </div>
        <Button
          variant="primary"
          // Using shadow for prominence
          className="shadow-md shadow-indigo-300/50"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Client
        </Button>
      </div>

      {/* Search & Controls - Integrated below header */}
      {!showEmptyState && (
        <div className="flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Search clients by name, email, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              // Enhanced search bar styling
              className="pl-11 pr-4 py-2.5 w-full rounded-xl border-slate-300 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          {/* Add potential filters here if needed, but for now, keep it clean */}
        </div>
      )}

      {/* Table or Empty State */}
      {showEmptyState ? (
        <EmptyState
          icon={<Users className="h-8 w-8 text-indigo-500" />}
          title="No clients yet"
          description="Get started by adding your first client to track projects and manage scope."
          action={{
            label: 'Add Client',
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="overflow-visible rounded-xl border border-slate-200 shadow-md">
          {/* Note: The 'Table' component needs to support enhanced styling on rows (e.g., hover, padding) 
              This is usually done via Tailwind classes injected into the component, assuming 
              the generic 'Table' component is flexible enough. The render functions above 
              include the enhanced typography. */}
          <Table<Client>
            data={filteredClients}
            columns={columns}
            isLoading={false}
            onRowClick={handleRowClick}
            emptyMessage={
              searchQuery
                ? `No clients found matching "${searchQuery}"`
                : 'No clients available'
            }
            // Assuming the Table component is styled externally to include
            // row padding and hover effects (e.g., 'group' class on row element)
          />
        </div>
      )}

      {/* Create/Edit Modal */}
      <ClientFormModal
        isOpen={isCreateModalOpen || !!editingClient}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
      />

      {/* Delete Confirmation Modal */}
      <DeleteClientModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        client={deletingClient}
      />
    </div>
  );
};

export default ClientsPage;