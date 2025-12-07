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
  ArrowUpRight,
  Lock,
  AlertTriangle,
  Info,
  Crown
} from 'lucide-react';
import { useClients } from '../../hooks/useClients';
import { useFeatureGate } from '../../hooks/useFeatureGate';
import {
  Button,
  Input,
  Table,
  EmptyState,
  Dropdown,
  useToast,
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
  const toast = useToast();
  const { canCreateClient, currentUsage, limits, isPro, clientsRemaining } = useFeatureGate();
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

  const handleCreateClient = () => {
    if (!canCreateClient) {
      toast.error('Client limit reached. Upgrade to Pro for unlimited clients!');
      navigate('/settings/billing');
      return;
    }
    setIsCreateModalOpen(true);
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
      {/* Limit Reached Banner - Show prominently when at limit */}
      {!isPro && currentUsage.clients >= limits.maxClients && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-amber-900 text-lg mb-1">Client limit reached</h4>
              <p className="text-sm text-amber-800 mb-4">
                You've reached the maximum of {limits.maxClients} clients on the Free plan.{' '}
                Upgrade to Pro for unlimited clients.
              </p>
              <Button
                size="sm"
                onClick={() => navigate('/settings/billing')}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Warning if approaching limit */}
      {!isPro && currentUsage.clients === limits.maxClients - 1 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800 font-medium">
                You have 1 client slot remaining on the Free plan.{' '}
                <button
                  onClick={() => navigate('/settings/billing')}
                  className="underline font-semibold hover:text-blue-900"
                >
                  Upgrade to Pro
                </button>
                {' '}for unlimited clients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="mt-2 text-slate-600 max-w-2xl">
            Manage your client roster. You are currently working with <span className="font-semibold text-indigo-600">{stats.total} clients</span> across <span className="font-semibold text-slate-900">{stats.activeProjects} active projects</span>.
            {!isPro && currentUsage.clients < limits.maxClients && (
              <span className="block mt-1 text-sm text-slate-500">
                {clientsRemaining} {clientsRemaining === 1 ? 'client' : 'clients'} remaining on Free plan
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          {canCreateClient ? (
            <Button
              variant="primary"
              className="shadow-lg shadow-indigo-500/20"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={handleCreateClient}
            >
              Add Client
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/settings/billing')}
              className="border-amber-300 text-amber-700 hover:bg-amber-50 hover:border-amber-400"
              leftIcon={<Lock className="h-4 w-4" />}
            >
              Upgrade to Add More
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {showEmptyState ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm">
          <EmptyState
            icon={<Users className="h-12 w-12 text-indigo-100" />}
            title="Build your client list"
            description="Add your first client to start tracking projects, proposals, and scope requests."
            action={
              canCreateClient
                ? {
                    label: 'Add First Client',
                    onClick: handleCreateClient,
                  }
                : {
                    label: 'Upgrade to Pro',
                    onClick: () => navigate('/settings/billing'),
                  }
            }
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
              emptyMessage={`No clients found matching "${searchQuery}"`}
            />
          </div>
          
          <div className="text-right">
             <p className="text-xs text-slate-400">
               Showing {filteredClients.length} of {clients.length} clients
             </p>
          </div>
        </div>
      )}

      {/* Modals - Only render create modal if allowed */}
      {(canCreateClient || editingClient) && (
        <ClientFormModal
          isOpen={isCreateModalOpen || !!editingClient}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingClient(null);
          }}
          client={editingClient}
        />
      )}

      <DeleteClientModal
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        client={deletingClient}
      />
    </div>
  );
};

export default ClientsPage;