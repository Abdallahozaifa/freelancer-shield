import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, FileText, CheckCircle2, Send, 
  DollarSign, Archive
} from 'lucide-react';
import { Button, Spinner, Badge } from '../../../components/ui';
import { ProposalRow } from './ProposalRow';
import { ProposalFormModal } from './ProposalFormModal';
import { SendProposalModal } from './SendProposalModal';
import { ProposalResponseModal } from './ProposalResponseModal';
import {
  useProposals, useCreateProposal, useUpdateProposal, useDeleteProposal, useSendProposal
} from '../../../hooks/useApi';
import { useAcceptProposal, useDeclineProposal } from '../../../hooks/useProposals';
import type { Proposal, ProposalCreate, ProposalUpdate, ProposalStatus } from '../../../types';
import { cn } from '../../../utils/cn';

interface ProposalsTabProps {
  projectId: string;
}

// Simplified workflow: Draft -> Sent -> Accepted
type TabFilter = 'all' | 'draft' | 'sent' | 'accepted';

export const ProposalsTab: React.FC<ProposalsTabProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [responseType, setResponseType] = useState<'accept' | 'decline' | undefined>();

  // Queries
  const { data, isLoading, refetch } = useProposals(projectId);
  const proposals = data?.items ?? [];

  // Mutations
  const createProposal = useCreateProposal(projectId);
  const updateProposal = useUpdateProposal(projectId);
  const deleteProposal = useDeleteProposal(projectId);
  const sendProposal = useSendProposal(projectId);
  const acceptProposal = useAcceptProposal(projectId);
  const declineProposal = useDeclineProposal(projectId);

  // Stats for badges
  const stats = useMemo(() => ({
    draft: proposals.filter(p => p.status === 'draft').length,
    sent: proposals.filter(p => p.status === 'sent').length,
    accepted: proposals.filter(p => p.status === 'accepted').length,
    total: proposals.length
  }), [proposals]);

  // Filter Logic
  const filteredProposals = useMemo(() => {
    let filtered = [...proposals];

    if (activeTab !== 'all') {
      filtered = filtered.filter(p => p.status === activeTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) => p.title.toLowerCase().includes(query) || p.description?.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [proposals, activeTab, searchQuery]);

  // Sorting: Drafts -> Sent -> Accepted -> Others
  const sortedProposals = useMemo(() => {
    const statusOrder: Record<ProposalStatus, number> = { draft: 0, sent: 1, accepted: 2, declined: 3, expired: 4 };
    return [...filteredProposals].sort((a, b) => {
      const statusDiff = statusOrder[a.status] - statusOrder[b.status];
      if (statusDiff !== 0) return statusDiff;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredProposals]);

  // Handlers
  const handleCreate = () => { setSelectedProposal(null); setIsFormModalOpen(true); };
  const handleEdit = (p: Proposal) => { setSelectedProposal(p); setIsFormModalOpen(true); };
  const handleSend = (p: Proposal) => { setSelectedProposal(p); setIsSendModalOpen(true); };
  const handleDelete = async (p: Proposal) => { 
    if (window.confirm(`Delete "${p.title}"?`)) await deleteProposal.mutateAsync(p.id); 
  };
  const handleMarkResponse = (p: Proposal, type: 'accept' | 'decline') => { 
    setSelectedProposal(p); 
    setResponseType(type); 
    setIsResponseModalOpen(true); 
  };

  const handleFormSubmit = async (data: ProposalCreate | ProposalUpdate) => {
    if (selectedProposal) await updateProposal.mutateAsync({ id: selectedProposal.id, data });
    else await createProposal.mutateAsync(data as ProposalCreate);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in -mt-4">
      {/* Main Unified Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[600px]">
        
        {/* 1. Header Toolbar */}
        <div className="border-b border-slate-200 bg-white p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search proposals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Action */}
            <Button 
              onClick={handleCreate}
              className="shadow-sm whitespace-nowrap h-9"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Proposal
            </Button>
          </div>

          {/* Simplified Filter Tabs */}
          <div className="flex items-center gap-1 mt-6 -mb-4 overflow-x-auto no-scrollbar">
            <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="All" count={stats.total} />
            <TabButton active={activeTab === 'draft'} onClick={() => setActiveTab('draft')} label="Drafts" count={stats.draft} />
            <TabButton active={activeTab === 'sent'} onClick={() => setActiveTab('sent')} label="Sent" count={stats.sent} variant="info" />
            <TabButton active={activeTab === 'accepted'} onClick={() => setActiveTab('accepted')} label="Accepted" count={stats.accepted} variant="success" />
          </div>
        </div>

        {/* 2. List Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-5">Proposal Details</div>
          <div className="col-span-2 hidden md:block text-right pr-4">Amount</div>
          <div className="col-span-2 hidden md:block">Status</div>
          <div className="col-span-2 hidden md:block text-right">Created</div>
          <div className="col-span-1 text-center"></div>
        </div>

        {/* 3. The List */}
        <div className="flex-1 bg-white relative">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Spinner size="lg" />
            </div>
          ) : sortedProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center px-4">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                <FileText className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">No proposals found</h3>
              <p className="text-slate-500 text-sm max-w-xs">
                {activeTab === 'all' 
                  ? "Create a proposal to bill for extra work." 
                  : `No ${activeTab.toLowerCase()} proposals.`}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedProposals.map((proposal) => (
                <ProposalRow
                  key={proposal.id}
                  proposal={proposal}
                  onEdit={() => handleEdit(proposal)}
                  onSend={() => handleSend(proposal)}
                  onDelete={() => handleDelete(proposal)}
                  onAccept={() => handleMarkResponse(proposal, 'accept')}
                  onDecline={() => handleMarkResponse(proposal, 'decline')}
                />
              ))}
            </div>
          )}
        </div>
        
        {sortedProposals.length > 0 && (
          <div className="bg-slate-50/50 border-t border-slate-200 p-2 text-center text-xs text-slate-400 font-medium">
            Showing {sortedProposals.length} item{sortedProposals.length !== 1 && 's'}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProposalFormModal
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); setSelectedProposal(null); }}
        onSubmit={handleFormSubmit}
        proposal={selectedProposal}
      />
      <SendProposalModal
        isOpen={isSendModalOpen}
        onClose={() => { setIsSendModalOpen(false); setSelectedProposal(null); }}
        onConfirm={async () => { if(selectedProposal) await sendProposal.mutateAsync(selectedProposal.id); }}
        proposal={selectedProposal}
      />
      <ProposalResponseModal
        isOpen={isResponseModalOpen}
        onClose={() => { setIsResponseModalOpen(false); setSelectedProposal(null); setResponseType(undefined); }}
        onAccept={async () => { if(selectedProposal) await acceptProposal.mutateAsync(selectedProposal.id); }}
        onDecline={async () => { if(selectedProposal) await declineProposal.mutateAsync(selectedProposal.id); }}
        proposal={selectedProposal}
        initialResponse={responseType}
      />
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, label, count, variant }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap hover:bg-slate-50",
      active 
        ? variant === 'success' ? "border-emerald-500 text-emerald-700 bg-emerald-50/30"
        : variant === 'info' ? "border-blue-500 text-blue-700 bg-blue-50/30"
        : "border-indigo-500 text-indigo-700 bg-indigo-50/30"
        : "border-transparent text-slate-500 hover:text-slate-700"
    )}
  >
    {label}
    {count > 0 && (
      <span className={cn(
        "px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold",
        active ? "bg-white shadow-sm" : "bg-slate-200 text-slate-600"
      )}>
        {count}
      </span>
    )}
  </button>
);

export default ProposalsTab;