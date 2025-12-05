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

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useClients();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Extract clients from nested structure: data.items.clients
  const clients: Client[] = useMemo(() => {
    if (!data) return [];
    // Handle: data.items.clients (actual structure from API)
    if (data.items?.clients && Array.isArray(data.items.clients)) {
      return data.items.clients;
    }
    // Handle: data.items (if it's directly an array)
    if (Array.isArray(data.items)) {
      return data.items;
    }
    // Handle: data is directly an array
    if (Array.isArray(data)) {
      return data;
    }
    return [];
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
      render: (client) => (
        <div className="font-medium text-gray-900">{client.name}</div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      render: (client) => (
        <span className="text-gray-600">{client.company || 'â€”'}</span>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (client) => (
        <span className="text-gray-600">{client.email || 'â€”'}</span>
      ),
    },
    {
      key: 'project_count',
      header: 'Projects',
      width: '100px',
      render: (client) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {client.project_count}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (client) => (
        <span className="text-gray-500 text-sm">
          {formatDate(client.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '60px',
      render: (client) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            trigger={
              <button className="p-1 rounded hover:bg-gray-100 transition-colors">
                <MoreHorizontal className="h-5 w-5 text-gray-400" />
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
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="mt-1 text-sm text-gray-500">
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
        <Table
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">
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

      {/* Search - hide when empty state */}
      {!showEmptyState && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {/* Table or Empty State */}
      {showEmptyState ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="No clients yet"
          description="Get started by adding your first client to track projects and manage scope."
          action={{
            label: 'Add Client',
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
      ) : (
        <div className="overflow-visible">
          <Table
            data={filteredClients}
            columns={columns}
            isLoading={false}
            onRowClick={handleRowClick}
            emptyMessage={
              searchQuery
                ? `No clients found matching "${searchQuery}"`
                : 'No clients available'
            }
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