import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Inbox,
  Sparkles,
  Mail,
  MessageCircle,
  Phone,
  Users,
  FileText,
  CheckCircle2,
  XCircle,
  MoreVertical,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { Button, Spinner, useToast, Badge, Dropdown } from '../../../components/ui';
import { useFeatureGate } from '../../../hooks/useFeatureGate';
import { UpgradePrompt, ProFeatureBadge } from '../../../components/ui';
import { formatRelative } from '../../../utils/format';
import { RequestCard } from './RequestCard';
import { RequestFormModal, RequestFormData } from './RequestFormModal';
import { CreateProposalFromRequest } from './CreateProposalFromRequest';
import {
  useRequests,
  useCreateRequest,
  useUpdateRequest,
  useClassifyRequest,
  useCreateProposalFromRequest,
} from '../../../hooks/useRequests';
import { useProject } from '../../../hooks/useProjects';
import type { ClientRequest, ProposalCreate, RequestSource } from '../../../types';
import { cn } from '../../../utils/cn';

interface RequestsTabProps {
  projectId: string;
}

type TabFilter = 'all' | 'out_of_scope' | 'processed' | 'archived';

export const RequestsTab: React.FC<RequestsTabProps> = ({ projectId }) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);

  const { data: project } = useProject(projectId);
  const { isPro } = useFeatureGate();
  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useRequests(projectId); // Fetch all requests, not just active ones

  const toast = useToast();
  const createRequest = useCreateRequest();
  const updateRequest = useUpdateRequest();
  const classifyRequest = useClassifyRequest();
  const createProposal = useCreateProposalFromRequest();

  // --- Calculate counts from actual data ---
  const counts = useMemo(() => {
    if (!requestsData?.items) return { all: 0, outOfScope: 0, processed: 0, archived: 0 };
    
    // Use allItems to include addressed/archived items for accurate counts
    const items = requestsData.allItems || requestsData.items;
    
    return {
      // All = active items needing attention (new or analyzed but not yet addressed)
      all: items.filter(r => 
        r.status === 'new' || 
        r.status === 'analyzed'
      ).length,
      // Out of Scope = classified as out_of_scope, still active (not addressed/proposal_sent/declined)
      outOfScope: items.filter(r => 
        r.classification === 'out_of_scope' && 
        (r.status === 'new' || r.status === 'analyzed')
      ).length,
      // Processed = currently being worked on (in_scope and active)
      processed: items.filter(r => 
        r.classification === 'in_scope' && 
        (r.status === 'new' || r.status === 'analyzed')
      ).length,
      // Archived = HISTORY - all completed requests (addressed, proposal_sent, declined)
      archived: items.filter(r => 
        r.status === 'addressed' || 
        r.status === 'proposal_sent' || 
        r.status === 'declined'
      ).length,
    };
  }, [requestsData?.items, requestsData?.allItems]);

  // --- Filtering Logic ---
  const filteredRequests = useMemo(() => {
    if (!requestsData?.items) return [];
    // Use allItems to include addressed/archived items for History tab
    const allItems = requestsData.allItems || requestsData.items;
    let filtered = [...allItems];

    switch (activeTab) {
      case 'all':
        // Active items needing attention
        filtered = filtered.filter(r => 
          r.status === 'new' || 
          r.status === 'analyzed'
        );
        break;
      case 'out_of_scope':
        // Out of scope and still active
        filtered = filtered.filter(r => 
          r.classification === 'out_of_scope' && 
          (r.status === 'new' || r.status === 'analyzed')
        );
        break;
      case 'processed':
        // In scope and still active
        filtered = filtered.filter(r => 
          r.classification === 'in_scope' && 
          (r.status === 'new' || r.status === 'analyzed')
        );
        break;
      case 'archived':
        // HISTORY - all completed requests
        filtered = filtered.filter(r => 
          r.status === 'addressed' || 
          r.status === 'proposal_sent' || 
          r.status === 'declined'
        );
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(query) || 
        r.content.toLowerCase().includes(query)
      );
    }
    return filtered;
  }, [requestsData?.items, requestsData?.allItems, activeTab, searchQuery]);

  // --- Sorting Logic ---
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      // Priority: Out of Scope > Newest
      if (a.classification === 'out_of_scope' && b.classification !== 'out_of_scope') return -1;
      if (b.classification === 'out_of_scope' && a.classification !== 'out_of_scope') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredRequests]);

  // --- Handlers ---
  const handleCreateRequest = async (data: RequestFormData) => {
    try {
      const result = await createRequest.mutateAsync({ projectId, data });
      toast.success('Request logged successfully');
      refetchRequests();
      return result;
    } catch (error) {
      toast.error('Failed to log request. Please try again.');
      throw error;
    }
  };

  const handleSubmitProposal = async (data: ProposalCreate) => {
    try {
      await createProposal.mutateAsync({ projectId, data });
      if (selectedRequest) {
        await updateRequest.mutateAsync({ 
          projectId, 
          requestId: selectedRequest.id, 
          data: { status: 'proposal_sent' } 
        });
      }
      toast.success('Proposal created and sent successfully');
      refetchRequests();
    } catch (error) {
      toast.error('Failed to create proposal. Please try again.');
    }
  };

  const actions = {
    markAddressed: async (r: ClientRequest) => {
      if (r.status === 'addressed') {
        toast.info('Request is already addressed');
        return;
      }
      try {
        await updateRequest.mutateAsync({ 
          projectId, 
          requestId: r.id, 
          data: { status: 'addressed' } 
        });
        toast.success('Request marked as addressed');
        refetchRequests();
      } catch (error) {
        toast.error('Failed to mark request as addressed');
      }
    },
    dismiss: async (r: ClientRequest) => {
      if (r.status === 'declined') {
        toast.info('Request is already declined');
        return;
      }
      try {
        await updateRequest.mutateAsync({ 
          projectId, 
          requestId: r.id, 
          data: { status: 'declined' } 
        });
        toast.success('Request dismissed');
        refetchRequests();
      } catch (error) {
        toast.error('Failed to dismiss request');
      }
    },
    restore: async (r: ClientRequest) => {
      if (r.status === 'new' && !r.classification) {
        toast.info('Request is already active');
        return;
      }
      try {
        await updateRequest.mutateAsync({ 
          projectId, 
          requestId: r.id, 
          data: { status: 'new', classification: null } 
        });
        toast.success('Request restored');
        refetchRequests();
      } catch (error) {
        toast.error('Failed to restore request');
      }
    },
    classifyOut: async (r: ClientRequest) => {
      if (r.classification === 'out_of_scope') {
        toast.info('Request is already classified as out of scope');
        return;
      }
      try {
        await classifyRequest.mutateAsync({ 
          projectId, 
          requestId: r.id, 
          classification: 'out_of_scope' 
        });
        toast.success('Request classified as out of scope');
        refetchRequests();
      } catch (error) {
        toast.error('Failed to classify request');
      }
    },
    classifyIn: async (r: ClientRequest) => {
      if (r.classification === 'in_scope') {
        toast.info('Request is already classified as in scope');
        return;
      }
      try {
        await classifyRequest.mutateAsync({ 
          projectId, 
          requestId: r.id, 
          classification: 'in_scope' 
        });
        toast.success('Request classified as in scope');
        refetchRequests();
      } catch (error) {
        toast.error('Failed to classify request');
      }
    },
    classifyInfo: async (r: ClientRequest) => {
      if (r.classification === 'clarification_needed') {
        toast.info('Request already needs clarification');
        return;
      }
      try {
        await classifyRequest.mutateAsync({ 
          projectId, 
          requestId: r.id, 
          classification: 'clarification_needed' 
        });
        toast.success('Request marked as needs clarification');
        refetchRequests();
      } catch (error) {
        toast.error('Failed to classify request');
      }
    },
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
            onClick={() => setIsFormModalOpen(true)}
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
            count={counts.all}
          />
          <MobileFilterPill
            active={activeTab === 'out_of_scope'}
            onClick={() => setActiveTab('out_of_scope')}
            label="Out of Scope"
            count={counts.outOfScope}
            variant="danger"
          />
          <MobileFilterPill
            active={activeTab === 'processed'}
            onClick={() => setActiveTab('processed')}
            label="Processed"
            count={counts.processed}
          />
          <MobileFilterPill
            active={activeTab === 'archived'}
            onClick={() => setActiveTab('archived')}
            label="History"
            count={counts.archived}
          />
        </div>

        {/* Mobile AI Detection Banner */}
        {activeTab === 'all' && (
          <div className="mb-2">
            {isPro ? (
              <button
                onClick={() => toast.success('AI analysis feature coming soon!')}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 active:bg-slate-100 transition-colors"
              >
                <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium text-slate-900 text-sm">Smart Detection</p>
                  <p className="text-xs text-slate-500">AI-powered scope analysis</p>
                </div>
              </button>
            ) : (
              <UpgradePrompt
                feature="Smart Detection"
                description="AI-powered scope creep detection."
                variant="banner"
              />
            )}
          </div>
        )}

        {/* Mobile Requests List */}
        {requestsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : sortedRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-slate-900 font-medium mb-1">
              {searchQuery ? 'No matching requests' : 'No requests here'}
            </h3>
            <p className="text-slate-500 text-sm">
              {activeTab === 'all'
                ? "Log a new client request to get started."
                : "Check other tabs or log a new request."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRequests.map((request) => (
              <MobileRequestCard
                key={request.id}
                request={request}
                onCreateProposal={() => { setSelectedRequest(request); setIsProposalModalOpen(true); }}
                actions={actions}
                hourlyRate={project?.hourly_rate}
              />
            ))}
          </div>
        )}

        {sortedRequests.length > 0 && (
          <p className="text-center text-xs text-slate-400 py-2">
            {sortedRequests.length} request{sortedRequests.length !== 1 && 's'}
          </p>
        )}
      </div>

      {/* ============================================ */}
      {/* DESKTOP LAYOUT - Only visible at lg and above */}
      {/* ============================================ */}
      {/* Main Unified Card */}
      <div className="hidden lg:flex bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-col min-h-[600px]">

        {/* 1. Header Toolbar */}
        <div className="border-b border-slate-200 bg-white p-4 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Action */}
            <Button
              onClick={() => setIsFormModalOpen(true)}
              className="shadow-sm whitespace-nowrap h-9 w-full sm:w-auto"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Log Request
            </Button>
          </div>

          {/* Smart Scope Detection Section */}
          {activeTab === 'all' && (
            <div className="mt-3 sm:mt-4 mb-3 sm:mb-4 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-xs sm:text-sm">Smart Scope Detection</h3>
                  {!isPro && <ProFeatureBadge />}
                </div>
                {isPro ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // TODO: Implement AI analysis for all requests
                      toast.success('AI analysis feature coming soon!');
                    }}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">Analyze All Requests</span>
                    <span className="sm:hidden">Analyze All</span>
                  </Button>
                ) : (
                  <UpgradePrompt
                    feature="Smart Scope Detection"
                    description="Let AI automatically detect scope creep in client requests."
                    variant="inline"
                    className="mt-0"
                  />
                )}
              </div>
            </div>
          )}

          {/* Filter Tabs - Scrollable on mobile */}
          <div className="flex items-center gap-1 mt-4 sm:mt-6 -mb-4 overflow-x-auto scrollbar-hide">
            <TabButton
              active={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              label="All"
              count={counts.all}
            />
            <TabButton
              active={activeTab === 'out_of_scope'}
              onClick={() => setActiveTab('out_of_scope')}
              label="Out of Scope"
              count={counts.outOfScope}
              variant="danger"
            />
            <TabButton
              active={activeTab === 'processed'}
              onClick={() => setActiveTab('processed')}
              label="Processed"
              count={counts.processed}
            />
            <TabButton
              active={activeTab === 'archived'}
              onClick={() => setActiveTab('archived')}
              label="History"
              count={counts.archived}
            />
          </div>
        </div>

        {/* 2. List Header - Hidden on mobile, shown on desktop */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-5">Request Details</div>
          <div className="col-span-2">Source</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Received</div>
          <div className="col-span-1 text-center"></div> {/* Actions placeholder */}
        </div>

        {/* 3. The List */}
        <div className="flex-1 bg-white relative">
          {requestsLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Spinner size="lg" />
            </div>
          ) : sortedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 sm:h-80 text-center px-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                <Inbox className="w-6 h-6 sm:w-7 sm:h-7 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-medium mb-1 text-sm sm:text-base">
                {searchQuery ? 'No matching requests' : 'No requests here'}
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm max-w-xs">
                {activeTab === 'all'
                  ? "Log a new client request to get started."
                  : "Check other tabs or log a new request."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onCreateProposal={() => { setSelectedRequest(request); setIsProposalModalOpen(true); }}
                  actions={actions}
                  hourlyRate={project?.hourly_rate}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {sortedRequests.length > 0 && (
          <div className="bg-slate-50/50 border-t border-slate-200 p-2 sm:p-2 text-center text-xs text-slate-400 font-medium">
            Showing {sortedRequests.length} item{sortedRequests.length !== 1 && 's'}
          </div>
        )}
      </div>

      {/* Modals */}
      <RequestFormModal
        isOpen={isFormModalOpen}
        onClose={() => { setIsFormModalOpen(false); refetchRequests(); }}
        onSubmit={handleCreateRequest}
        isSubmitting={createRequest.isPending}
      />
      <CreateProposalFromRequest
        isOpen={isProposalModalOpen}
        onClose={() => { setIsProposalModalOpen(false); setSelectedRequest(null); refetchRequests(); }}
        onSubmit={handleSubmitProposal}
        request={selectedRequest}
        hourlyRate={project?.hourly_rate}
        isSubmitting={createProposal.isPending}
      />
    </div>
  );
};

// Simplified Tab Button - Shows count even if 1 (Desktop)
const TabButton = ({ active, onClick, label, count, variant }: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  variant?: 'danger';
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap hover:bg-slate-50",
        active
          ? variant === 'danger'
            ? "border-red-500 text-red-700 bg-red-50/30"
            : "border-indigo-500 text-indigo-700 bg-indigo-50/30"
          : "border-transparent text-slate-500 hover:text-slate-700"
      )}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={cn(
          "px-1.5 py-0.5 rounded-full text-[10px] leading-none font-bold",
          active
            ? "bg-white shadow-sm"
            : "bg-slate-200 text-slate-600"
        )}>
          {count}
        </span>
      )}
    </button>
  );
};

// Mobile Filter Pill Component
const MobileFilterPill = ({ active, onClick, label, count, variant }: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
  variant?: 'danger';
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
      active
        ? variant === 'danger'
          ? "bg-red-100 text-red-700 border border-red-200"
          : "bg-indigo-100 text-indigo-700 border border-indigo-200"
        : "bg-white text-slate-600 border border-slate-200"
    )}
  >
    {label}
    {count !== undefined && count > 0 && (
      <span className={cn(
        "min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold",
        active ? "bg-white/80" : "bg-slate-100"
      )}>
        {count}
      </span>
    )}
  </button>
);

// Mobile Request Card Component
const mobileSourceIcons: Record<RequestSource, React.ElementType> = {
  email: Mail, chat: MessageCircle, call: Phone, meeting: Users, other: FileText,
};

interface MobileRequestCardProps {
  request: ClientRequest;
  onCreateProposal: () => void;
  actions: {
    markAddressed: (r: ClientRequest) => Promise<void>;
    dismiss: (r: ClientRequest) => Promise<void>;
    restore: (r: ClientRequest) => Promise<void>;
    classifyOut: (r: ClientRequest) => Promise<void>;
    classifyIn: (r: ClientRequest) => Promise<void>;
    classifyInfo: (r: ClientRequest) => Promise<void>;
  };
  hourlyRate?: number | string | null;
}

const MobileRequestCard: React.FC<MobileRequestCardProps> = ({
  request, onCreateProposal, actions, hourlyRate: hourlyRateProp
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const SourceIcon = mobileSourceIcons[request.source];

  const isOutOfScope = request.classification === 'out_of_scope';
  const isInScope = request.classification === 'in_scope';
  const isPending = !request.classification || request.classification === 'pending';
  const isClarification = request.classification === 'clarification_needed';
  const isAddressed = request.status === 'addressed';
  const isDeclined = request.status === 'declined';
  const isProposalSent = request.status === 'proposal_sent';
  const isArchived = isAddressed || isDeclined || isProposalSent;
  const isActive = request.status === 'new' || request.status === 'analyzed';

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true);
    try { await action(); } finally { setIsProcessing(false); }
  };

  const getStatusBadge = () => {
    if (isProposalSent) {
      return { text: 'Proposal Sent', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
    if (isAddressed || isInScope) {
      return { text: 'Processed', className: 'bg-slate-100 text-slate-600 border-slate-200' };
    }
    if (isOutOfScope) {
      return { text: 'Out of Scope', className: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (isClarification) {
      return { text: 'Needs Info', className: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
    return { text: 'Pending', className: 'bg-amber-100 text-amber-700 border-amber-200' };
  };

  const status = getStatusBadge();

  return (
    <div className={cn(
      "bg-white rounded-xl border shadow-sm overflow-hidden transition-colors",
      isOutOfScope ? "border-red-200" : "border-slate-200",
      isProcessing && "opacity-50 pointer-events-none"
    )}>
      {/* Alert indicator bar for out of scope */}
      {isOutOfScope && (
        <div className="h-1 bg-gradient-to-r from-red-500 to-orange-500" />
      )}

      {/* Card Content */}
      <div className="p-4" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className={cn("text-xs border", status.className)}
                size="sm"
              >
                {status.text}
              </Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <SourceIcon className="w-3 h-3" />
                {request.source}
              </span>
            </div>

            {/* Title */}
            <h3 className={cn(
              "font-semibold text-slate-900",
              isArchived && "line-through text-slate-400"
            )}>
              {request.title}
            </h3>

            {/* Content Preview */}
            <p className="text-sm text-slate-500 line-clamp-2 mt-1">
              {request.content}
            </p>

            {/* Time */}
            <p className="text-xs text-slate-400 mt-2">
              {formatRelative(request.created_at)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {!isArchived && (
              <Dropdown
                trigger={
                  <button
                    className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4 text-slate-500" />
                  </button>
                }
                items={[
                  { label: 'Mark Addressed', icon: <CheckCircle2 className="w-4 h-4" />, onClick: () => handleAction(() => actions.markAddressed(request)) },
                  { label: 'Dismiss', icon: <XCircle className="w-4 h-4" />, onClick: () => handleAction(() => actions.dismiss(request)), danger: true }
                ]}
                align="right"
              />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Actions */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 space-y-3" onClick={(e) => e.stopPropagation()}>
          {/* Full Content */}
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{request.content}</p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {/* History Tab: Restore button */}
            {isArchived && (
              <button
                onClick={() => handleAction(() => actions.restore(request))}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg active:bg-slate-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Request
              </button>
            )}

            {/* Active Requests - Triage buttons */}
            {isActive && !isProposalSent && (isPending || isClarification) && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(() => actions.classifyOut(request))}
                  className={cn(
                    "flex-1 py-2 text-xs font-medium rounded-lg border transition-colors",
                    isOutOfScope
                      ? "bg-red-100 text-red-700 border-red-200"
                      : "bg-white text-slate-600 border-slate-200 active:bg-slate-50"
                  )}
                >
                  Out of Scope
                </button>
                <button
                  onClick={() => handleAction(() => actions.classifyInfo(request))}
                  className={cn(
                    "flex-1 py-2 text-xs font-medium rounded-lg border transition-colors",
                    isClarification
                      ? "bg-blue-100 text-blue-700 border-blue-200"
                      : "bg-white text-slate-600 border-slate-200 active:bg-slate-50"
                  )}
                >
                  Needs Info
                </button>
                <button
                  onClick={() => handleAction(() => actions.classifyIn(request))}
                  className={cn(
                    "flex-1 py-2 text-xs font-medium rounded-lg border transition-colors",
                    isInScope
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-white text-slate-600 border-slate-200 active:bg-slate-50"
                  )}
                >
                  In Scope
                </button>
              </div>
            )}

            {/* Out of Scope Actions */}
            {isActive && isOutOfScope && (
              <div className="space-y-2">
                <button
                  onClick={onCreateProposal}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg active:bg-slate-800 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Generate Proposal
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(() => actions.markAddressed(request))}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-slate-700 text-sm font-medium rounded-lg border border-slate-200 active:bg-slate-50 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Addressed
                  </button>
                  <button
                    onClick={() => handleAction(() => actions.dismiss(request))}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 active:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* In Scope Actions */}
            {isActive && isInScope && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction(() => actions.markAddressed(request))}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg active:bg-emerald-700 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Addressed
                </button>
                <button
                  onClick={() => handleAction(() => actions.dismiss(request))}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white text-red-600 text-sm font-medium rounded-lg border border-red-200 active:bg-red-50 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsTab;