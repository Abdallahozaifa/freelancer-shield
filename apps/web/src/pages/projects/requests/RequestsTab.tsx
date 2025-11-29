import React, { useState, useMemo } from 'react';
import { Plus, Search, AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button, EmptyState, Spinner } from '../../../components/ui';
import { RequestStats, StatsFilter } from './RequestStats';
import { RequestCard } from './RequestCard';
import { RequestFormModal, RequestFormData } from './RequestFormModal';
import { CreateProposalFromRequest } from './CreateProposalFromRequest';
import {
  useRequests,
  useRequestStats,
  useCreateRequest,
  useUpdateRequest,
  useAnalyzeRequest,
  useCreateProposalFromRequest,
} from '../../../hooks/useRequests';
import { useProject } from '../../../hooks/useProjects';
import type { ClientRequest, ProposalCreate } from '../../../types';

interface RequestsTabProps {
  projectId: string;
}

type ViewMode = 'active' | 'history';
type HistoryFilter = 'all' | 'addressed' | 'declined';

export const RequestsTab: React.FC<RequestsTabProps> = ({ projectId }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [statsFilter, setStatsFilter] = useState<StatsFilter>('all');
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
  const analyzeRequest = useAnalyzeRequest();
  const createProposal = useCreateProposalFromRequest();

  // Filter requests based on view mode and filters
  const filteredRequests = useMemo(() => {
    if (!requestsData?.items) return [];
    
    let filtered = [...requestsData.items];

    // Apply stats filter (only for active view)
    if (viewMode === 'active' && statsFilter !== 'all') {
      filtered = filtered.filter(r => r.classification === statsFilter);
    }

    // Apply history filter (only for history view)
    if (viewMode === 'history') {
      if (historyFilter === 'addressed') {
        filtered = filtered.filter(r => r.status === 'addressed');
      } else if (historyFilter === 'declined') {
        filtered = filtered.filter(r => r.status === 'declined');
      } else {
        // 'all' - show both addressed and declined
        filtered = filtered.filter(r => r.status === 'addressed' || r.status === 'declined');
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.title.toLowerCase().includes(query) ||
          request.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [requestsData?.items, viewMode, statsFilter, historyFilter, searchQuery]);

  // Sort requests: out_of_scope first for active view, newest first for history
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      if (viewMode === 'active') {
        // Out of scope first
        if (a.classification === 'out_of_scope' && b.classification !== 'out_of_scope') return -1;
        if (b.classification === 'out_of_scope' && a.classification !== 'out_of_scope') return 1;
      }
      // Then by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [filteredRequests, viewMode]);

  // Handlers
  const handleCreateRequest = async (data: RequestFormData): Promise<ClientRequest> => {
    const result = await createRequest.mutateAsync({
      projectId,
      data: {
        title: data.title,
        content: data.content,
        source: data.source,
      },
    });
    return result;
  };

  const handleFormModalClose = () => {
    setIsFormModalOpen(false);
    refetchRequests();
  };

  const handleCreateProposal = (request: ClientRequest) => {
    setSelectedRequest(request);
    setIsProposalModalOpen(true);
  };

  const handleSubmitProposal = async (data: ProposalCreate) => {
    await createProposal.mutateAsync({ projectId, data });
    if (selectedRequest) {
      await updateRequest.mutateAsync({
        projectId,
        requestId: selectedRequest.id,
        data: { status: 'proposal_sent' },
      });
    }
    refetchRequests();
  };

  const handleMarkAddressed = async (request: ClientRequest): Promise<void> => {
    await updateRequest.mutateAsync({
      projectId,
      requestId: request.id,
      data: { status: 'addressed' },
    });
    refetchRequests();
  };

  const handleDismiss = async (request: ClientRequest): Promise<void> => {
    await updateRequest.mutateAsync({
      projectId,
      requestId: request.id,
      data: { status: 'declined' },
    });
    refetchRequests();
  };

  const handleRestore = async (request: ClientRequest): Promise<void> => {
    await updateRequest.mutateAsync({
      projectId,
      requestId: request.id,
      data: { status: 'analyzed' },
    });
    refetchRequests();
  };

  const handleReanalyze = async (request: ClientRequest): Promise<void> => {
    await analyzeRequest.mutateAsync({ projectId, requestId: request.id });
    refetchRequests();
  };

  const handleMarkInScope = async (request: ClientRequest): Promise<void> => {
    await updateRequest.mutateAsync({
      projectId,
      requestId: request.id,
      data: { classification: 'in_scope' },
    });
    refetchRequests();
  };

  const isLoading = requestsLoading || statsLoading;
  const archivedCount = stats.addressed + stats.declined;

  // ACTIVE VIEW
  if (viewMode === 'active') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Active Requests</h2>
          <button
            onClick={() => setViewMode('history')}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            View History →
          </button>
        </div>

        {/* Alert Banner */}
        {stats.outOfScope > 0 && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-red-800">
                {stats.outOfScope} request{stats.outOfScope > 1 ? 's' : ''} need attention
              </p>
              <p className="text-sm text-red-600">
                Review and create proposals to protect your earnings.
              </p>
            </div>
          </div>
        )}

        {/* Clickable Stats Cards */}
        <RequestStats
          total={stats.active}
          inScope={stats.inScope}
          outOfScope={stats.outOfScope}
          clarificationNeeded={stats.clarificationNeeded}
          isLoading={statsLoading}
          activeFilter={statsFilter}
          onFilterChange={setStatsFilter}
        />

        {/* Search + Log Button */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetchRequests()}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <Button onClick={() => setIsFormModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log Request
          </Button>
        </div>

        {/* Request List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : sortedRequests.length === 0 ? (
          <EmptyState
            icon={<Search className="w-12 h-12" />}
            title={
              statsFilter !== 'all'
                ? `No ${statsFilter.replace('_', ' ')} requests`
                : 'No active requests'
            }
            description={
              statsFilter !== 'all'
                ? 'Try selecting a different filter above.'
                : 'Log client requests to track scope and detect scope creep.'
            }
            action={
              statsFilter === 'all' && (
                <Button onClick={() => setIsFormModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Request
                </Button>
              )
            }
          />
        ) : (
          <div className="space-y-4">
            {sortedRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                onCreateProposal={handleCreateProposal}
                onMarkAddressed={handleMarkAddressed}
                onDismiss={handleDismiss}
                onReanalyze={handleReanalyze}
                onMarkInScope={handleMarkInScope}
                hourlyRate={project?.hourly_rate}
              />
            ))}
          </div>
        )}

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
          <h2 className="text-lg font-semibold text-gray-800">Request History</h2>
        </div>
        <span className="text-sm text-gray-500">{archivedCount} archived requests</span>
      </div>

      {/* History Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setHistoryFilter('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            historyFilter === 'all'
              ? 'bg-gray-200 text-gray-800'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setHistoryFilter('addressed')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            historyFilter === 'addressed'
              ? 'bg-gray-200 text-gray-800'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          Addressed ({stats.addressed})
        </button>
        <button
          onClick={() => setHistoryFilter('declined')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
            historyFilter === 'declined'
              ? 'bg-gray-200 text-gray-800'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
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

      {/* Archived Request List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : sortedRequests.length === 0 ? (
        <EmptyState
          icon={<Search className="w-12 h-12" />}
          title="No archived requests"
          description="Requests you address or dismiss will appear here."
        />
      ) : (
        <div className="space-y-3">
          {sortedRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onCreateProposal={handleCreateProposal}
              onMarkAddressed={handleMarkAddressed}
              onDismiss={handleDismiss}
              onReanalyze={handleReanalyze}
              onRestore={handleRestore}
              hourlyRate={project?.hourly_rate}
              isArchived
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestsTab;
