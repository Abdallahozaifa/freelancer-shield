import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Users, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Building2, 
  Briefcase,
  Mail,
  ArrowUpRight
} from 'lucide-react';
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

// Helper to generate initials for avatar
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Helper to pick a consistent color based on string length (for avatars)
const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-violet-100 text-violet-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700',
  ];
  return colors[name.length % colors.length];
};

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useClients();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const clients: Client[] = useMemo(() => {
    if (!data || !Array.isArray(data.items)) return [];
    return data.items;
  }, [data]);

  // Calculate summary stats
  const stats = useMemo(() => {
    return {
      total: clients.length,
      activeProjects: clients.reduce((acc, c) => acc + (c.project_count || 0), 0)
    };
  }, [clients]);

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
      label: 'View Details',
      icon: <ArrowUpRight className="h-4 w-4" />,
      onClick: () => navigate(`/clients/${client.id}`),
    },
    {
      label: 'Edit Client',
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
      header: 'Client',
      sortable: true,
      width: '40%',
      render: (client) => (
        <div className="flex items-center gap-3 py-1">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full text-xs font-bold ${getAvatarColor(client.name)}`}>
            {getInitials(client.name)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {client.name}
            </span>
            {client.email && (
              <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3 h-3" />
                {client.email}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'company',
      header: 'Company',
      width: '25%',
      render: (client) => (
        <div className="flex items-center gap-2 text-slate-600">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-sm">{client.company || '—'}</span>
        </div>
      ),
    },
    {
      key: 'project_count',
      header: 'Projects',
      width: '15%',
      render: (client) => (
        <div className="flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-slate-400" />
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 tabular-nums">
            {client.project_count}
          </span>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Joined',
      sortable: true,
      width: '15%',
      render: (client) => (
        <span className="text-slate-500 text-sm">
          {formatDate(client.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '5%',
      render: (client) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-end">
          <Dropdown
            trigger={
              <button className="p-2 rounded-lg text-slate-400 hover:bg-white hover:shadow-sm hover:text-slate-600 hover:border hover:border-slate-200 transition-all">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            }
            items={getDropdownItems(client)}
            align="right"
          />
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
         <div className="h-8 bg-slate-200 rounded w-48" />
         <div className="h-64 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  const showEmptyState = clients.length === 0 && !searchQuery;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Manage your client roster. You are currently working with <span className="font-semibold text-indigo-600">{stats.total} clients</span> across <span className="font-semibold text-slate-900">{stats.activeProjects} active projects</span>.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            className="shadow-lg shadow-indigo-500/20"
            leftIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add Client
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {showEmptyState ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm">
          <EmptyState
            icon={<Users className="h-12 w-12 text-indigo-100" />}
            title="Build your client list"
            description="Add your first client to start tracking projects, proposals, and scope requests."
            action={{
              label: 'Add First Client',
              onClick: () => setIsCreateModalOpen(true),
            }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-2.5 w-full bg-white border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl transition-all shadow-sm"
              />
            </div>
            {/* Optional: Add Filter/Sort dropdowns here in the future */}
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <Table<Client>
              data={filteredClients}
              columns={columns}
              isLoading={false}
              onRowClick={handleRowClick}
              emptyMessage={
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-500">No clients found matching "{searchQuery}"</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-indigo-600 font-medium text-sm mt-2 hover:underline"
                  >
                    Clear search
                  </button>
                </div>
              }
            />
          </div>
          
          <div className="text-right">
             <p className="text-xs text-slate-400">
               Showing {filteredClients.length} of {clients.length} clients
             </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <ClientFormModal
        isOpen={isCreateModalOpen || !!editingClient}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingClient(null);
        }}
        client={editingClient}
      />

      <DeleteClientModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        client={deletingClient}
      />
    </div>
  );
};

export default ClientsPage;