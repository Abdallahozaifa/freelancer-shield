import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, FileText, Sparkles, DollarSign, Send as SendIcon,
  CheckCircle2, XCircle, MoreVertical, Edit, Trash2, Copy
} from 'lucide-react';
import { Button, Spinner, useToast, Badge, Dropdown } from '../../../components/ui';
import { useFeatureGate } from '../../../hooks/useFeatureGate';
import { UpgradePrompt } from '../../../components/ui';
import { formatCurrency, formatRelative } from '../../../utils/format';
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
  const { isPro } = useFeatureGate();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [responseType, setResponseType] = useState<'accept' | 'decline' | undefined>();

  const navigate = useNavigate();

  // Check if on mobile (< 1024px for lg breakpoint)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  // Queries
  const { data, isLoading, refetch } = useProposals(projectId);
  const proposals = data?.items ?? [];
  const toast = useToast();

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
  const handleCreate = () => {
    if (isMobile) {
      navigate(`/projects/${projectId}/proposals/new`);
    } else {
      setSelectedProposal(null);
      setIsFormModalOpen(true);
    }
  };

  const handleEdit = (p: Proposal) => {
    if (p.status === 'accepted') {
      toast.warning('Editing accepted proposals is not recommended. Consider creating a new proposal.');
    }
    if (isMobile) {
      navigate(`/projects/${projectId}/proposals/edit?proposal=${p.id}`);
    } else {
      setSelectedProposal(p);
      setIsFormModalOpen(true);
    }
  };

  const handleSend = (p: Proposal) => { 
    if (p.status !== 'draft') {
      toast.error('Only draft proposals can be sent');
      return;
    }
    setSelectedProposal(p); 
    setIsSendModalOpen(true); 
  };

  const handleDelete = async (p: Proposal) => { 
    if (p.status !== 'draft') {
      toast.error('Only draft proposals can be deleted');
      return;
    }
    if (window.confirm(`Delete "${p.title}"? This action cannot be undone.`)) {
      try {
        await deleteProposal.mutateAsync(p.id);
        toast.success('Proposal deleted successfully');
        refetch();
      } catch (error) {
        toast.error('Failed to delete proposal');
      }
    }
  };

  const handleDuplicate = async (p: Proposal) => {
    try {
      const duplicateData: ProposalCreate = {
        title: `${p.title} (Copy)`,
        description: p.description,
        amount: p.amount,
        estimated_hours: p.estimated_hours,
        source_request_id: p.source_request_id || undefined,
      };
      await createProposal.mutateAsync(duplicateData);
      toast.success('Proposal duplicated successfully');
      refetch();
    } catch (error) {
      toast.error('Failed to duplicate proposal');
    }
  };

  const handleMarkResponse = (p: Proposal, type: 'accept' | 'decline') => { 
    if (p.status !== 'sent') {
      toast.error('Only sent proposals can be marked as accepted or declined');
      return;
    }
    setSelectedProposal(p); 
    setResponseType(type); 
    setIsResponseModalOpen(true); 
  };

  const handleFormSubmit = async (data: ProposalCreate | ProposalUpdate) => {
    try {
      if (selectedProposal) {
        await updateProposal.mutateAsync({ id: selectedProposal.id, data });
        toast.success('Proposal updated successfully');
      } else {
        await createProposal.mutateAsync(data as ProposalCreate);
        toast.success('Proposal created successfully');
      }
      setIsFormModalOpen(false);
      setSelectedProposal(null);
      refetch();
    } catch (error) {
      toast.error(selectedProposal ? 'Failed to update proposal' : 'Failed to create proposal');
    }
  };

  const handleSendConfirm = async () => {
    if (!selectedProposal) return;
    try {
      await sendProposal.mutateAsync(selectedProposal.id);
      toast.success('Proposal sent successfully');
      setIsSendModalOpen(false);
      setSelectedProposal(null);
      refetch();
    } catch (error) {
      toast.error('Failed to send proposal');
    }
  };

  const handleAccept = async () => {
    if (!selectedProposal) return;
    try {
      await acceptProposal.mutateAsync(selectedProposal.id);
      toast.success('Proposal marked as accepted');
      setIsResponseModalOpen(false);
      setSelectedProposal(null);
      setResponseType(undefined);
      refetch();
    } catch (error) {
      toast.error('Failed to mark proposal as accepted');
    }
  };

  const handleDecline = async () => {
    if (!selectedProposal) return;
    try {
      await declineProposal.mutateAsync(selectedProposal.id);
      toast.success('Proposal marked as declined');
      setIsResponseModalOpen(false);
      setSelectedProposal(null);
      setResponseType(undefined);
      refetch();
    } catch (error) {
      toast.error('Failed to mark proposal as declined');
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in -mt-4">
      {/* ============================================ */}
      {/* MOBILE LAYOUT - Only visible below lg */}
      {/* ============================================ */}
      <div className="lg:hidden space-y-4">
        {/* Mobile Header with Search & Create */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
            />
          </div>
          <Button
            onClick={handleCreate}
            className="h-10 px-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            size="sm"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {/* Mobile Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <MobileFilterPill
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            label="All"
            count={stats.total}
          />
          <MobileFilterPill
            active={activeTab === 'draft'}
            onClick={() => setActiveTab('draft')}
            label="Drafts"
            count={stats.draft}
          />
          <MobileFilterPill
            active={activeTab === 'sent'}
            onClick={() => setActiveTab('sent')}
            label="Sent"
            count={stats.sent}
            variant="info"
          />
          <MobileFilterPill
            active={activeTab === 'accepted'}
            onClick={() => setActiveTab('accepted')}
            label="Accepted"
            count={stats.accepted}
            variant="success"
          />
        </div>

        {/* Mobile Proposal Generator Banner */}
        {activeTab === 'all' && (
          <div className="mb-2">
            {isPro ? (
              <button
                onClick={() => toast.success('Proposal generator feature coming soon!')}
                className="w-full p-3 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center gap-3 active:bg-indigo-100 transition-colors"
              >
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-indigo-900 text-sm">Generate Proposal</p>
                  <p className="text-xs text-indigo-600">AI-powered from requests</p>
                </div>
              </button>
            ) : (
              <UpgradePrompt
                feature="Proposal Generator"
                description="Auto-generate proposals from requests."
                variant="banner"
              />
            )}
          </div>
        )}

        {/* Mobile Proposals List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : sortedProposals.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-medium mb-1">No proposals found</h3>
            <p className="text-slate-500 text-sm">
              {activeTab === 'all'
                ? "Create a proposal to bill for extra work."
                : `No ${activeTab.toLowerCase()} proposals.`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedProposals.map((proposal) => (
              <MobileProposalCard
                key={proposal.id}
                proposal={proposal}
                onEdit={() => handleEdit(proposal)}
                onSend={() => handleSend(proposal)}
                onDelete={() => handleDelete(proposal)}
                onAccept={() => handleMarkResponse(proposal, 'accept')}
                onDecline={() => handleMarkResponse(proposal, 'decline')}
                onDuplicate={() => handleDuplicate(proposal)}
              />
            ))}
          </div>
        )}

        {sortedProposals.length > 0 && (
          <p className="text-center text-xs text-slate-400 py-2">
            {sortedProposals.length} proposal{sortedProposals.length !== 1 && 's'}
          </p>
        )}
      </div>

      {/* ============================================ */}
      {/* DESKTOP LAYOUT - Only visible at lg and above */}
      {/* ============================================ */}
      {/* Main Unified Card */}
      <div className="hidden lg:flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-col min-h-[600px]">

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

          {/* One-Click Proposal Generator Section */}
          {activeTab === 'all' && (
            <div className="mt-4 mb-4">
              {isPro ? (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-indigo-900 text-sm">One-Click Proposal Generator</h3>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // TODO: Implement proposal generator
                        toast.success('Proposal generator feature coming soon!');
                      }}
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Proposal
                    </Button>
                  </div>
                  <p className="text-xs text-indigo-700 mt-2">
                    Automatically generate professional proposals from out-of-scope requests.
                  </p>
                </div>
              ) : (
                <UpgradePrompt
                  feature="One-Click Proposal Generator"
                  description="Automatically generate professional proposals from out-of-scope requests."
                  variant="banner"
                />
              )}
            </div>
          )}

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
                  onDuplicate={() => handleDuplicate(proposal)}
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
        onConfirm={handleSendConfirm}
        proposal={selectedProposal}
      />
      <ProposalResponseModal
        isOpen={isResponseModalOpen}
        onClose={() => { setIsResponseModalOpen(false); setSelectedProposal(null); setResponseType(undefined); }}
        onAccept={handleAccept}
        onDecline={handleDecline}
        proposal={selectedProposal}
        initialResponse={responseType}
      />
    </div>
  );
};

// Tab Button Component (Desktop)
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

// Mobile Filter Pill Component
const MobileFilterPill = ({ active, onClick, label, count, variant }: any) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
      active
        ? variant === 'success' ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
        : variant === 'info' ? "bg-blue-100 text-blue-700 border border-blue-200"
        : "bg-indigo-100 text-indigo-700 border border-indigo-200"
        : "bg-white text-slate-600 border border-slate-200"
    )}
  >
    {label}
    {count > 0 && (
      <span className={cn(
        "min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold",
        active ? "bg-white/80" : "bg-slate-100"
      )}>
        {count}
      </span>
    )}
  </button>
);

// Mobile Proposal Card Component
interface MobileProposalCardProps {
  proposal: Proposal;
  onEdit: () => void;
  onSend: () => void;
  onDelete: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onDuplicate: () => void;
}

const MobileProposalCard: React.FC<MobileProposalCardProps> = ({
  proposal, onEdit, onSend, onDelete, onAccept, onDecline, onDuplicate
}) => {
  const isDraft = proposal.status === 'draft';
  const isSent = proposal.status === 'sent';
  const isAccepted = proposal.status === 'accepted';
  const isDeclined = proposal.status === 'declined';

  const statusColors = {
    draft: 'bg-slate-100 text-slate-700 border-slate-200',
    sent: 'bg-blue-100 text-blue-700 border-blue-200',
    accepted: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    declined: 'bg-red-100 text-red-700 border-red-200',
    expired: 'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <div className={cn(
      "bg-white rounded-xl border shadow-sm overflow-hidden",
      isAccepted ? "border-emerald-200 ring-1 ring-emerald-100" : "border-slate-200"
    )}>
      {/* Card Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className={cn(
              "font-semibold text-slate-900 truncate",
              isDeclined && "line-through text-slate-500"
            )}>
              {proposal.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatRelative(proposal.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              className={cn("text-xs border", statusColors[proposal.status])}
              size="sm"
            >
              {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
            </Badge>
            <Dropdown
              trigger={
                <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                  <MoreVertical className="w-4 h-4 text-slate-500" />
                </button>
              }
              items={[
                ...(!isAccepted ? [{ label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: onEdit }] : []),
                { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, onClick: onDuplicate },
                ...(isDraft ? [{ label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, danger: true }] : []),
              ]}
              align="right"
            />
          </div>
        </div>

        {/* Description */}
        {proposal.description && (
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {proposal.description}
          </p>
        )}

        {/* Amount */}
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg",
          isAccepted ? "bg-emerald-50" : "bg-slate-50"
        )}>
          <DollarSign className={cn(
            "w-5 h-5",
            isAccepted ? "text-emerald-600" : "text-slate-400"
          )} />
          <span className={cn(
            "text-lg font-bold",
            isAccepted ? "text-emerald-700" : "text-slate-900"
          )}>
            {formatCurrency(proposal.amount)}
          </span>
          {isAccepted && (
            <span className="ml-auto text-xs font-medium text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Protected
            </span>
          )}
        </div>
      </div>

      {/* Action Bar */}
      {(isDraft || isSent) && (
        <div className="px-4 pb-4 pt-1 flex gap-2">
          {isDraft && (
            <button
              onClick={onSend}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg active:bg-indigo-700 transition-colors"
            >
              <SendIcon className="w-4 h-4" />
              Send to Client
            </button>
          )}
          {isSent && (
            <>
              <button
                onClick={onAccept}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg active:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept
              </button>
              <button
                onClick={onDecline}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 active:bg-red-50 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Decline
              </button>
            </>
          )}
        </div>
      )}

      {/* Accepted/Declined Message */}
      {isAccepted && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Client accepted this proposal</span>
          </div>
        </div>
      )}
      {isDeclined && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 p-2.5 bg-red-50 rounded-lg border border-red-100">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-700">Client declined this proposal</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalsTab;