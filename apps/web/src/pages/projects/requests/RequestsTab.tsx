import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  AlertTriangle, 
  Inbox,
  CheckCircle2,
  FileQuestion,
  Archive,
  Ban,
  FileText,
  Filter
} from 'lucide-react';
import { Button, EmptyState, Spinner, Badge } from '../../../components/ui';
import { RequestCard } from './RequestCard';
import { RequestFormModal, RequestFormData } from './RequestFormModal';
import { CreateProposalFromRequest } from './CreateProposalFromRequest';
import {
  useRequests,
  useRequestStats,
  useCreateRequest,
  useUpdateRequest,
  useClassifyRequest,
  useCreateProposalFromRequest,
} from '../../../hooks/useRequests';
import { useProject } from '../../../hooks/useProjects';
import type { ClientRequest, ProposalCreate } from '../../../types';

interface RequestsTabProps {
  projectId: string;
}

type ViewMode = 'active' | 'history';
type FilterType = 'all' | 'pending' | 'out_of_scope' | 'in_scope' | 'clarification_needed';
type HistoryFilter = 'all' | 'addressed' | 'declined' | 'proposal_sent';

export const RequestsTab: React.FC<RequestsTabProps> = ({ projectId }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null);

  // Hooks
  const { data: project } = useProject(projectId);
  const { stats, isLoading: statsLoading } = useRequestStats(projectId);
  const {
    data: requestsData,
    isLoading: requestsLoading,
    refetch: refetchRequests,
  } = useRequests(projectId, { showActive: viewMode === 'active' });

  const createRequest = useCreateRequest();
  const updateRequest = useUpdateRequest();
  const classifyRequest = useClassifyRequest();
  const createProposal = useCreateProposalFromRequest();

  // Filter Logic
  const filteredRequests = useMemo(() => {
    if (!requestsData?.items) return [];
    
    let filtered = [...requestsData.items];

    if (viewMode === 'active') {
      if (activeFilter === 'pending') {
        filtered = filtered.filter(r => !r.classification);
      } else if (activeFilter !== 'all') {
        filtered = filtered.filter(r => r.classification === activeFilter);
      }
    }

    if (viewMode === 'history') {
      if (historyFilter !== 'all') {
        filtered = filtered.filter(r => r.status === historyFilter);
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.title.toLowerCase().includes(query) ||
          request.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [requestsData?.items, viewMode, activeFilter, historyFilter, searchQuery]);

  // Sort Logic
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      // Priority sorting for active view
      if (viewMode === 'active') {
        if (!a.classification && b.classification) return -1;
        if (a.classification && !b.classification) return 1;
        if (a.classification === 'out_of_scope' && b.classification !== 'out_of_scope') return -1;
        if (b.classification === 'out_of_scope' && a.classification !== 'out_of_scope') return 1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredRequests, viewMode]);

  // Handlers
  const handleCreateRequest = async (data: RequestFormData) => {
    const result = await createRequest.mutateAsync({ projectId, data });
    return result;
  };
  const handleFormModalClose = () => { setIsFormModalOpen(false); refetchRequests(); };
  const handleCreateProposal = (request: ClientRequest) => { setSelectedRequest(request); setIsProposalModalOpen(true); };
  const handleSubmitProposal = async (data: ProposalCreate) => {
    await createProposal.mutateAsync({ projectId, data });
    if (selectedRequest) await updateRequest.mutateAsync({ projectId, requestId: selectedRequest.id, data: { status: 'proposal_sent' } });
    refetchRequests();
  };
  const handleMarkAddressed = async (request: ClientRequest) => { await updateRequest.mutateAsync({ projectId, requestId: request.id, data: { status: 'addressed' } }); refetchRequests(); };
  const handleDismiss = async (request: ClientRequest) => { await updateRequest.mutateAsync({ projectId, requestId: request.id, data: { status: 'declined' } }); refetchRequests(); };
  const handleRestore = async (request: ClientRequest) => { await updateRequest.mutateAsync({ projectId, requestId: request.id, data: { status: 'new', classification: null } }); refetchRequests(); };
  const handleMarkOutOfScope = async (request: ClientRequest) => { await classifyRequest.mutateAsync({ projectId, requestId: request.id, classification: 'out_of_scope' }); refetchRequests(); };
  const handleMarkInScope = async (request: ClientRequest) => { await classifyRequest.mutateAsync({ projectId, requestId: request.id, classification: 'in_scope' }); refetchRequests(); };
  const handleMarkClarificationNeeded = async (request: ClientRequest) => { await classifyRequest.mutateAsync({ projectId, requestId: request.id, classification: 'clarification_needed' }); refetchRequests(); };

  const isLoading = requestsLoading || statsLoading;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* --- Filter Bar (Horizontal) --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <FilterPill 
            label="Active Inbox" 
            count={stats.active} 
            active={viewMode === 'active' && activeFilter === 'all'} 
            onClick={() => { setViewMode('active'); setActiveFilter('all'); }}
            icon={Inbox}
          />
          <FilterPill 
            label="Pending" 
            count={stats.pending} 
            variant="warning"
            active={activeFilter === 'pending'} 
            onClick={() => { setViewMode('active'); setActiveFilter('pending'); }}
            icon={AlertTriangle}
          />
          <FilterPill 
            label="Out of Scope" 
            count={stats.outOfScope} 
            variant="danger"
            active={activeFilter === 'out_of_scope'} 
            onClick={() => { setViewMode('active'); setActiveFilter('out_of_scope'); }}
            icon={AlertTriangle}
          />
          <FilterPill 
            label="Needs Info" 
            count={stats.clarificationNeeded} 
            variant="info"
            active={activeFilter === 'clarification_needed'} 
            onClick={() => { setViewMode('active'); setActiveFilter('clarification_needed'); }}
            icon={FileQuestion}
          />
           <div className="h-6 w-px bg-slate-200 mx-1"></div>
          <FilterPill 
            label="Archived" 
            active={viewMode === 'history'} 
            onClick={() => { setViewMode('history'); setHistoryFilter('all'); }}
            icon={Archive}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
           {/* Search Input */}
           <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <Button 
            onClick={() => setIsFormModalOpen(true)} 
            className="shadow-md shadow-indigo-500/20 whitespace-nowrap"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Log Request
          </Button>
        </div>
      </div>

      {/* --- Secondary History Filters (Only visible in History Mode) --- */}
      {viewMode === 'history' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-400 uppercase mr-2">Filter History:</span>
            <SubFilterPill label="All" active={historyFilter === 'all'} onClick={() => setHistoryFilter('all')} />
            <SubFilterPill label="Proposals Sent" active={historyFilter === 'proposal_sent'} onClick={() => setHistoryFilter('proposal_sent')} />
            <SubFilterPill label="Addressed" active={historyFilter === 'addressed'} onClick={() => setHistoryFilter('addressed')} />
            <SubFilterPill label="Declined" active={historyFilter === 'declined'} onClick={() => setHistoryFilter('declined')} />
        </div>
      )}

      {/* --- Content Area --- */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size="lg" />
          </div>
        ) : sortedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-50/50 rounded-xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
              <Inbox className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {viewMode === 'active' ? 'Inbox Zero' : 'No history found'}
            </h3>
            <p className="text-slate-500 max-w-xs mx-auto text-sm">
              {viewMode === 'active' 
                ? "Great job! You have no active requests pending review." 
                : "Archived requests will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onCreateProposal={handleCreateProposal}
                onMarkAddressed={handleMarkAddressed}
                onDismiss={handleDismiss}
                onRestore={handleRestore}
                onMarkOutOfScope={handleMarkOutOfScope}
                onMarkInScope={handleMarkInScope}
                onMarkClarificationNeeded={handleMarkClarificationNeeded}
                hourlyRate={project?.hourly_rate}
                isArchived={viewMode === 'history'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <RequestFormModal
        isOpen={isFormModalOpen}
        onClose={handleFormModalClose}
        onSubmit={handleCreateRequest}
        isSubmitting={createRequest.isPending}
      />

      <CreateProposalFromRequest
        isOpen={isProposalModalOpen}
        onClose={() => {
          setIsProposalModalOpen(false);
          setSelectedRequest(null);
          refetchRequests();
        }}
        onSubmit={handleSubmitProposal}
        request={selectedRequest}
        hourlyRate={project?.hourly_rate}
        isSubmitting={createProposal.isPending}
      />
    </div>
  );
};

// --- Components for Filters ---

const FilterPill = ({ label, count, active, onClick, icon: Icon, variant = 'neutral' }: any) => {
  const baseClasses = "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all border whitespace-nowrap";
  
  const variants = {
    neutral: active ? "bg-indigo-600 text-white border-indigo-600 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
    warning: active ? "bg-amber-500 text-white border-amber-500 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-700",
    danger: active ? "bg-red-500 text-white border-red-500 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-700",
    info: active ? "bg-blue-500 text-white border-blue-500 shadow-md" : "bg-white text-slate-600 border-slate-200 hover:bg-blue-50 hover:text-blue-700",
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]}`}>
      {Icon && <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />}
      {label}
      {count > 0 && (
        <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
          {count}
        </span>
      )}
    </button>
  );
};

const SubFilterPill = ({ label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 text-xs rounded-md transition-colors ${
      active ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"
    }`}
  >
    {label}
  </button>
);

export default RequestsTab;