import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Inbox
} from 'lucide-react';
import { Button, Spinner } from '../../../components/ui';
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
import type { ClientRequest, ProposalCreate } from '../../../types';
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
  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useRequests(projectId); // Fetch all requests, not just active ones

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
  const handleCreateRequest = async (data: RequestFormData) => await createRequest.mutateAsync({ projectId, data });
  const handleSubmitProposal = async (data: ProposalCreate) => {
    await createProposal.mutateAsync({ projectId, data });
    if (selectedRequest) await updateRequest.mutateAsync({ projectId, requestId: selectedRequest.id, data: { status: 'proposal_sent' } });
    refetchRequests();
  };

  const actions = {
    markAddressed: async (r: ClientRequest) => { await updateRequest.mutateAsync({ projectId, requestId: r.id, data: { status: 'addressed' } }); refetchRequests(); },
    dismiss: async (r: ClientRequest) => { await updateRequest.mutateAsync({ projectId, requestId: r.id, data: { status: 'declined' } }); refetchRequests(); },
    restore: async (r: ClientRequest) => { await updateRequest.mutateAsync({ projectId, requestId: r.id, data: { status: 'new', classification: null } }); refetchRequests(); },
    classifyOut: async (r: ClientRequest) => { await classifyRequest.mutateAsync({ projectId, requestId: r.id, classification: 'out_of_scope' }); refetchRequests(); },
    classifyIn: async (r: ClientRequest) => { await classifyRequest.mutateAsync({ projectId, requestId: r.id, classification: 'in_scope' }); refetchRequests(); },
    classifyInfo: async (r: ClientRequest) => { await classifyRequest.mutateAsync({ projectId, requestId: r.id, classification: 'clarification_needed' }); refetchRequests(); },
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
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            {/* Action */}
            <Button 
              onClick={() => setIsFormModalOpen(true)} 
              className="shadow-sm whitespace-nowrap h-9"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Log Request
            </Button>
          </div>

          {/* Filter Tabs - Clean Text Style */}
          <div className="flex items-center gap-1 mt-6 -mb-4 overflow-x-auto no-scrollbar">
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

        {/* 2. List Header - Bold & Distinct */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <div className="col-span-5">Request Details</div>
          <div className="col-span-2 hidden md:block">Source</div>
          <div className="col-span-2 hidden md:block">Status</div>
          <div className="col-span-2 hidden md:block text-right">Received</div>
          <div className="col-span-1 text-center"></div> {/* Actions placeholder */}
        </div>

        {/* 3. The List */}
        <div className="flex-1 bg-white relative">
          {requestsLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <Spinner size="lg" />
            </div>
          ) : sortedRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-80 text-center px-4">
              <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3 border border-slate-100">
                <Inbox className="w-7 h-7 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">
                {searchQuery ? 'No matching requests' : 'No requests here'}
              </h3>
              <p className="text-slate-500 text-sm max-w-xs">
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
          <div className="bg-slate-50/50 border-t border-slate-200 p-2 text-center text-xs text-slate-400 font-medium">
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

// Simplified Tab Button - Shows count even if 1
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
        "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap hover:bg-slate-50",
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

export default RequestsTab;