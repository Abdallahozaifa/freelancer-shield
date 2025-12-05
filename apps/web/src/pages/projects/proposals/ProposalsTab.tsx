import React, { useState, useMemo } from 'react';
import { Plus, Search, RefreshCw, FileText, ArrowLeft, DollarSign } from 'lucide-react';
import { Button, EmptyState, Spinner } from '../../../components/ui';
import { ProposalStats } from './ProposalStats';
import { ProposalCard } from './ProposalCard';
import { ProposalFormModal } from './ProposalFormModal';
import { SendProposalModal } from './SendProposalModal';
import { ProposalResponseModal } from './ProposalResponseModal';
import {
  useProposals,
  useCreateProposal,
  useUpdateProposal,
  useDeleteProposal,
  useSendProposal,
} from '../../../hooks/useApi';
import { useAcceptProposal, useDeclineProposal } from '../../../hooks/useProposals';
import { formatCurrency } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import type { Proposal, ProposalCreate, ProposalUpdate, ProposalStatus } from '../../../types';

interface ProposalsTabProps {
  projectId: string;
}

type ViewMode = 'active' | 'history';
type ActiveFilter = 'all' | 'draft' | 'sent';
type HistoryFilter = 'accepted' | 'declined';

export const ProposalsTab: React.FC<ProposalsTabProps> = ({ projectId }) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('draft');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('accepted');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [responseType, setResponseType] = useState<'accept' | 'decline' | undefined>();

  // Queries & Mutations
  const { data, isLoading, refetch } = useProposals(projectId);
  const createProposal = useCreateProposal(projectId);
  const updateProposal = useUpdateProposal(projectId);
  const deleteProposal = useDeleteProposal(projectId);
  const sendProposal = useSendProposal(projectId);
  const acceptProposal = useAcceptProposal(projectId);
  const declineProposal = useDeclineProposal(projectId);

  const proposals = data?.items ?? [];

  // Calculate stats
  const stats = useMemo(() => {
    const draft = proposals.filter(p => p.status === 'draft').length;
    const sent = proposals.filter(p => p.status === 'sent').length;
    const acceptedList = proposals.filter(p => p.status === 'accepted');
    const declined = proposals.filter(p => p.status === 'declined').length;
    
    const revenueProtected = acceptedList.reduce((sum, p) => sum + p.amount, 0);
    const pendingAmount = proposals
      .filter(p => p.status === 'sent')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      total: proposals.length,
      active: draft + sent,
      draft,
      sent,
      accepted: acceptedList.length,
      declined,
      revenueProtected,
      pendingAmount,
    };
  }, [proposals]);

  // Filter proposals based on view mode
  const filteredProposals = useMemo(() => {
    let filtered = [...proposals];

    if (viewMode === 'active') {
      // Active view: draft and sent only
      filtered = filtered.filter(p => p.status === 'draft' || p.status === 'sent');
      
      if (activeFilter === 'draft') {
        filtered = filtered.filter(p => p.status === 'draft');
      } else if (activeFilter === 'sent') {
        filtered = filtered.filter(p => p.status === 'sent');
      }
    } else {
      // History view: accepted and declined
      filtered = filtered.filter(p => p.status === historyFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (proposal) =>
          proposal.title.toLowerCase().includes(query) ||
          proposal.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [proposals, viewMode, activeFilter, historyFilter, searchQuery]);

  // Sort: drafts first, then sent, then by date
  const sortedProposals = useMemo(() => {
    const statusOrder: Record<ProposalStatus, number> = {
      draft: 0,
      sent: 1,
      accepted: 2,
      declined: 3,
      expired: 4,
    };

    return [...filteredProposals].sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredProposals]);

  // Handlers
  const handleCreateProposal = () => {
    setSelectedProposal(null);
    setIsFormModalOpen(true);
  };

  const handleEditProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsFormModalOpen(true);
  };

  const handleSendProposal = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setIsSendModalOpen(true);
  };

  const handleDeleteProposal = async (proposal: Proposal) => {
    if (!window.confirm(`Are you sure you want to delete "${proposal.title}"?`)) {
      return;
    }
    await deleteProposal.mutateAsync(proposal.id);
  };

  const handleMarkAccepted = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setResponseType('accept');
    setIsResponseModalOpen(true);
  };

  const handleMarkDeclined = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setResponseType('decline');
    setIsResponseModalOpen(true);
  };

  const handleFormSubmit = async (data: ProposalCreate | ProposalUpdate) => {
    if (selectedProposal) {
      await updateProposal.mutateAsync({ id: selectedProposal.id, data });
    } else {
      await createProposal.mutateAsync(data as ProposalCreate);
    }
  };

  const handleSendConfirm = async () => {
    if (selectedProposal) {
      await sendProposal.mutateAsync(selectedProposal.id);
    }
  };

  const handleAcceptConfirm = async () => {
    if (selectedProposal) {
      await acceptProposal.mutateAsync(selectedProposal.id);
    }
  };

  const handleDeclineConfirm = async () => {
    if (selectedProposal) {
      await declineProposal.mutateAsync(selectedProposal.id);
    }
  };

  const historyCount = stats.accepted + stats.declined;

  // ACTIVE VIEW
  if (viewMode === 'active') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Active Proposals</h2>
          <button
            onClick={() => setViewMode('history')}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            View History →
          </button>
        </div>

        {/* Stats Cards */}
        <ProposalStats
          draft={stats.draft}
          sent={stats.sent}
          pendingAmount={stats.pendingAmount}
          isLoading={isLoading}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Search + Create Button */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={handleCreateProposal}>
            <Plus className="w-4 h-4 mr-2" />
            Create Proposal
          </Button>
        </div>

        {/* Proposals List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : sortedProposals.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-12 h-12" />}
            title={
              activeFilter !== 'all'
                ? `No ${activeFilter} proposals`
                : searchQuery
                ? 'No matching proposals'
                : 'No active proposals'
            }
            description={
              activeFilter !== 'all'
                ? 'Try selecting a different filter above.'
                : searchQuery
                ? 'Try a different search term.'
                : 'Create proposals for out-of-scope work to protect your revenue.'
            }
            action={
              activeFilter === 'all' && !searchQuery
                ? { label: 'Create Proposal', onClick: handleCreateProposal }
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onEdit={handleEditProposal}
                onSend={handleSendProposal}
                onDelete={handleDeleteProposal}
                onMarkAccepted={handleMarkAccepted}
                onMarkDeclined={handleMarkDeclined}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <ProposalFormModal
          isOpen={isFormModalOpen}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedProposal(null);
          }}
          onSubmit={handleFormSubmit}
          proposal={selectedProposal}
        />

        <SendProposalModal
          isOpen={isSendModalOpen}
          onClose={() => {
            setIsSendModalOpen(false);
            setSelectedProposal(null);
          }}
          onConfirm={handleSendConfirm}
          proposal={selectedProposal}
        />

        <ProposalResponseModal
          isOpen={isResponseModalOpen}
          onClose={() => {
            setIsResponseModalOpen(false);
            setSelectedProposal(null);
            setResponseType(undefined);
          }}
          onAccept={handleAcceptConfirm}
          onDecline={handleDeclineConfirm}
          proposal={selectedProposal}
          initialResponse={responseType}
        />
      </div>
    );
  }

  // HISTORY VIEW
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('active')}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">Proposal History</h2>
        </div>
        <span className="text-sm text-gray-500">{historyCount} completed proposals</span>
      </div>

      {/* Revenue Protected Banner */}
      <div className="bg-white rounded-lg border-2 border-green-200 p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-green-100">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Revenue Protected</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(stats.revenueProtected)}
            </p>
          </div>
        </div>
      </div>

      {/* History Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setHistoryFilter('accepted')}
          className={cn(
            'px-3 py-1.5 text-sm rounded-lg transition-colors',
            historyFilter === 'accepted'
              ? 'bg-green-100 text-green-800'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          Accepted ({stats.accepted})
        </button>
        <button
          onClick={() => setHistoryFilter('declined')}
          className={cn(
            'px-3 py-1.5 text-sm rounded-lg transition-colors',
            historyFilter === 'declined'
              ? 'bg-red-100 text-red-800'
              : 'text-gray-500 hover:bg-gray-100'
          )}
        >
          Declined ({stats.declined})
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* History List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : sortedProposals.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-12 h-12" />}
          title={`No ${historyFilter} proposals`}
          description={
            historyFilter === 'accepted'
              ? 'Accepted proposals will appear here once clients approve them.'
              : 'Declined proposals will appear here.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onEdit={handleEditProposal}
              onSend={handleSendProposal}
              onDelete={handleDeleteProposal}
              onMarkAccepted={handleMarkAccepted}
              onMarkDeclined={handleMarkDeclined}
              isArchived
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProposalsTab;
