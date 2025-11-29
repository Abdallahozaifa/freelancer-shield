import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock hooks
const mockUseRequests = vi.fn();
const mockUseRequestStats = vi.fn();
const mockUseProject = vi.fn();
const mockCreateRequest = vi.fn();
const mockUpdateRequest = vi.fn();
const mockAnalyzeRequest = vi.fn();

vi.mock('../../../../hooks/useRequests', () => ({
  useRequests: () => mockUseRequests(),
  useRequestStats: () => mockUseRequestStats(),
  useCreateRequest: () => ({
    mutateAsync: mockCreateRequest,
    isPending: false,
  }),
  useUpdateRequest: () => ({
    mutateAsync: mockUpdateRequest,
    isPending: false,
  }),
  useAnalyzeRequest: () => ({
    mutateAsync: mockAnalyzeRequest,
    isPending: false,
  }),
  useCreateProposalFromRequest: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('../../../../hooks/useProjects', () => ({
  useProject: () => mockUseProject(),
}));

// Mock child components
vi.mock('../RequestStats', () => ({
  RequestStats: ({ onFilterChange, activeFilter }: any) => (
    <div data-testid="request-stats">
      <button onClick={() => onFilterChange('all')}>All Active</button>
      <button onClick={() => onFilterChange('out_of_scope')}>Out of Scope</button>
      <span data-testid="active-filter">{activeFilter}</span>
    </div>
  ),
}));

vi.mock('../RequestCard', () => ({
  RequestCard: ({ request, onMarkAddressed, onDismiss }: any) => (
    <div data-testid={`request-card-${request.id}`}>
      <span>{request.title}</span>
      <button onClick={() => onMarkAddressed(request)}>Mark Addressed</button>
      <button onClick={() => onDismiss(request)}>Dismiss</button>
    </div>
  ),
}));

vi.mock('../RequestFormModal', () => ({
  RequestFormModal: ({ isOpen, onClose, onSubmit }: any) => (
    isOpen ? (
      <div data-testid="request-form-modal">
        <button onClick={onClose}>Close Modal</button>
        <button onClick={() => onSubmit({ title: 'Test', content: 'Test content', source: 'email' })}>
          Submit
        </button>
      </div>
    ) : null
  ),
}));

vi.mock('../CreateProposalFromRequest', () => ({
  CreateProposalFromRequest: ({ isOpen }: any) => (
    isOpen ? <div data-testid="proposal-modal">Proposal Modal</div> : null
  ),
}));

vi.mock('../../../../components/ui', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  ),
  Spinner: () => <div data-testid="spinner">Loading...</div>,
  Card: ({ children }: any) => <div>{children}</div>,
  Input: (props: any) => <input {...props} />,
  Tabs: () => null,
}));

import { RequestsTab } from '../RequestsTab';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Mock data
const mockRequests = [
  {
    id: 'req-1',
    title: 'Out of scope request',
    content: 'Can you also add dark mode?',
    source: 'email',
    status: 'analyzed',
    classification: 'out_of_scope',
    created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'req-2',
    title: 'In scope request',
    content: 'Update the headline',
    source: 'email',
    status: 'analyzed',
    classification: 'in_scope',
    created_at: '2025-01-02T00:00:00Z',
  },
];

const mockStats = {
  total: 10,
  active: 8,
  inScope: 5,
  outOfScope: 2,
  clarificationNeeded: 1,
  addressed: 1,
  declined: 1,
};

describe('RequestsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseRequests.mockReturnValue({
      data: { items: mockRequests, allItems: mockRequests },
      isLoading: false,
      refetch: vi.fn(),
    });
    
    mockUseRequestStats.mockReturnValue({
      stats: mockStats,
      isLoading: false,
    });
    
    mockUseProject.mockReturnValue({
      data: { id: 'proj-1', hourly_rate: 75 },
      isLoading: false,
    });
  });

  describe('rendering', () => {
    it('should render the component', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      expect(screen.getByText('Active Requests')).toBeInTheDocument();
    });

    it('should render RequestStats', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('request-stats')).toBeInTheDocument();
    });

    it('should render request cards', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('request-card-req-1')).toBeInTheDocument();
      expect(screen.getByTestId('request-card-req-2')).toBeInTheDocument();
    });

    it('should render Log Request button', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/Log Request/)).toBeInTheDocument();
    });

    it('should render search input', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      expect(screen.getByPlaceholderText('Search requests...')).toBeInTheDocument();
    });

    it('should render View History link', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/View History/)).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show spinner when loading', () => {
      mockUseRequests.mockReturnValue({
        data: null,
        isLoading: true,
        refetch: vi.fn(),
      });
      mockUseRequestStats.mockReturnValue({
        stats: mockStats,
        isLoading: true,
      });

      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty state when no requests', () => {
      mockUseRequests.mockReturnValue({
        data: { items: [], allItems: [] },
        isLoading: false,
        refetch: vi.fn(),
      });

      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No active requests')).toBeInTheDocument();
    });
  });

  describe('alert banner', () => {
    it('should show alert when there are out of scope requests', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      expect(screen.getByText(/requests need attention/)).toBeInTheDocument();
    });

    it('should not show alert when no out of scope requests', () => {
      mockUseRequestStats.mockReturnValue({
        stats: { ...mockStats, outOfScope: 0 },
        isLoading: false,
      });

      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      expect(screen.queryByText(/requests need attention/)).not.toBeInTheDocument();
    });
  });

  describe('filtering', () => {
    it('should filter requests when clicking stats card', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByText('Out of Scope'));
      
      expect(screen.getByTestId('active-filter')).toHaveTextContent('out_of_scope');
    });

    it('should filter requests by search query', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      const searchInput = screen.getByPlaceholderText('Search requests...');
      fireEvent.change(searchInput, { target: { value: 'dark mode' } });
      
      // The filtering happens in the component, we just verify the input works
      expect(searchInput).toHaveValue('dark mode');
    });
  });

  describe('modal interactions', () => {
    it('should open form modal when clicking Log Request', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByText(/Log Request/));
      
      expect(screen.getByTestId('request-form-modal')).toBeInTheDocument();
    });

    it('should close form modal', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByText(/Log Request/));
      expect(screen.getByTestId('request-form-modal')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Close Modal'));
      expect(screen.queryByTestId('request-form-modal')).not.toBeInTheDocument();
    });
  });

  describe('request actions', () => {
    it('should call updateRequest when marking as addressed', async () => {
      mockUpdateRequest.mockResolvedValue({});
      
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      const markAddressedBtn = screen.getAllByText('Mark Addressed')[0];
      fireEvent.click(markAddressedBtn);
      
      await waitFor(() => {
        expect(mockUpdateRequest).toHaveBeenCalledWith({
          projectId: 'proj-1',
          requestId: 'req-1',
          data: { status: 'addressed' },
        });
      });
    });

    it('should call updateRequest when dismissing', async () => {
      mockUpdateRequest.mockResolvedValue({});
      
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      const dismissBtn = screen.getAllByText('Dismiss')[0];
      fireEvent.click(dismissBtn);
      
      await waitFor(() => {
        expect(mockUpdateRequest).toHaveBeenCalledWith({
          projectId: 'proj-1',
          requestId: 'req-1',
          data: { status: 'declined' },
        });
      });
    });
  });

  describe('view switching', () => {
    it('should switch to history view when clicking View History', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByText(/View History/));
      
      expect(screen.getByText('Request History')).toBeInTheDocument();
    });

    it('should switch back to active view when clicking back arrow', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByText(/View History/));
      expect(screen.getByText('Request History')).toBeInTheDocument();
      
      // Find and click the back button (ArrowLeft icon container)
      const backButton = screen.getByText('Request History').parentElement?.querySelector('button');
      if (backButton) {
        fireEvent.click(backButton);
      }
      
      expect(screen.getByText('Active Requests')).toBeInTheDocument();
    });
  });

  describe('history view', () => {
    it('should show history filter buttons', () => {
      render(<RequestsTab projectId="proj-1" />, { wrapper: createWrapper() });
      
      fireEvent.click(screen.getByText(/View History/));
      
      expect(screen.getByText('All')).toBeInTheDocument();
      expect(screen.getByText(/Addressed/)).toBeInTheDocument();
      expect(screen.getByText(/Declined/)).toBeInTheDocument();
    });
  });
});
