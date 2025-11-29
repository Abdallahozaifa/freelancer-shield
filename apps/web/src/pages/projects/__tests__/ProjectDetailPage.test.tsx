import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { ReactNode } from 'react';

// Mock functions
const mockUseProject = vi.fn();
const mockUseClients = vi.fn();
const mockDeleteProject = vi.fn();
const mockUpdateProject = vi.fn();
const mockUseScopeProgress = vi.fn();
const mockUseRequestStats = vi.fn();

vi.mock('../../../hooks/useProjects', () => ({
  useProjects: vi.fn(),
  useProject: () => mockUseProject(),
  useCreateProject: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateProject: () => ({
    mutateAsync: mockUpdateProject,
    isPending: false,
  }),
  useDeleteProject: () => ({
    mutateAsync: mockDeleteProject,
    isPending: false,
  }),
  projectKeys: {
    all: ['projects'],
    lists: () => ['projects', 'list'],
    list: (filters: string) => ['projects', 'list', { filters }],
    details: () => ['projects', 'detail'],
    detail: (id: string) => ['projects', 'detail', id],
  },
}));

vi.mock('../../../hooks/useClients', () => ({
  useClients: () => mockUseClients(),
  useClient: vi.fn(),
  useCreateClient: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateClient: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteClient: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  clientKeys: {
    all: ['clients'],
    lists: () => ['clients', 'list'],
    list: (filters: string) => ['clients', 'list', { filters }],
    details: () => ['clients', 'detail'],
    detail: (id: string) => ['clients', 'detail', id],
  },
}));

vi.mock('../../../hooks/useScope', () => ({
  useScopeProgress: () => mockUseScopeProgress(),
  useScopeItems: vi.fn(() => ({ data: { items: [] }, isLoading: false })),
  useCreateScopeItem: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateScopeItem: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteScopeItem: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock('../../../hooks/useRequests', () => ({
  useRequestStats: () => mockUseRequestStats(),
  useRequests: vi.fn(() => ({ data: { items: [] }, isLoading: false })),
  useCreateRequest: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateRequest: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteRequest: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useAnalyzeRequest: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

import { ProjectDetailPage } from '../ProjectDetailPage';

// Test wrapper with route params
const renderWithRouter = (projectId: string = '1') => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[`/projects/${projectId}`]}>
        <Routes>
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

// Mock data
const mockProject = {
  id: '1',
  client_id: 'client-1',
  client_name: 'Acme Corp',
  name: 'Website Redesign',
  description: 'Complete website overhaul',
  status: 'active' as const,
  budget: 5000,
  hourly_rate: 75,
  estimated_hours: 60,
  scope_item_count: 5,
  completed_scope_count: 2,
  out_of_scope_request_count: 1,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z',
};

const mockClients = [
  { id: 'client-1', name: 'Acme Corp', email: 'contact@acme.com', project_count: 1 },
];

const mockScopeProgress = {
  total_estimated_hours: 40,
  completed_estimated_hours: 16,
};

const mockRequestStats = {
  stats: {
    total: 3,
    inScope: 2,
    outOfScope: 1,
    clarificationNeeded: 0,
    addressed: 0,
    declined: 0,
    proposalSent: 0,
    active: 3,
  },
  isLoading: false,
};

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseClients.mockReturnValue({
      data: { items: mockClients, total: 1 },
      isLoading: false,
      error: null,
    });

    mockUseScopeProgress.mockReturnValue({
      data: mockScopeProgress,
      isLoading: false,
    });

    mockUseRequestStats.mockReturnValue(mockRequestStats);
  });

  describe('Loading State', () => {
    it('should show loading skeleton when data is loading', () => {
      mockUseProject.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithRouter();

      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      mockUseProject.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      });

      renderWithRouter();

      expect(screen.getByText(/Failed to load project/)).toBeInTheDocument();
    });
  });

  describe('Project Details', () => {
    beforeEach(() => {
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });
    });

    it('should render project name', () => {
      renderWithRouter();

      expect(screen.getByText('Website Redesign')).toBeInTheDocument();
    });

    it('should render client name in header', () => {
      renderWithRouter();

      // Client name appears in header subtitle and project details
      const clientElements = screen.getAllByText(/Acme Corp/);
      expect(clientElements.length).toBeGreaterThanOrEqual(1);
    });

    it('should render status badge', () => {
      renderWithRouter();

      // Use getAllByText since status appears in header and details section
      const statusBadges = screen.getAllByText('Active');
      expect(statusBadges.length).toBeGreaterThanOrEqual(1);
    });

    it('should render back link', () => {
      renderWithRouter();

      expect(screen.getByText(/Back to Projects/)).toBeInTheDocument();
    });

    it('should render Edit button', () => {
      renderWithRouter();

      expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    });

    it('should render tabs', () => {
      renderWithRouter();

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Scope')).toBeInTheDocument();
      expect(screen.getByText('Requests')).toBeInTheDocument();
      expect(screen.getByText('Proposals')).toBeInTheDocument();
    });
  });

  describe('Overview Tab', () => {
    beforeEach(() => {
      mockUseProject.mockReturnValue({
        data: mockProject,
        isLoading: false,
        error: null,
      });
    });

    it('should show budget section', () => {
      renderWithRouter();

      expect(screen.getByText('Budget')).toBeInTheDocument();
      expect(screen.getByText('$5,000')).toBeInTheDocument();
    });

    it('should show progress section', () => {
      renderWithRouter();

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('40%')).toBeInTheDocument(); // 2/5 = 40%
    });

    it('should show quick actions', () => {
      renderWithRouter();

      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Add Scope Item')).toBeInTheDocument();
      // Review Requests may appear multiple times (alert + quick actions)
      const reviewRequestsElements = screen.getAllByText('Review Requests');
      expect(reviewRequestsElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Create Proposal')).toBeInTheDocument();
    });

    it('should show project details section', () => {
      renderWithRouter();

      expect(screen.getByText('Project Details')).toBeInTheDocument();
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Created')).toBeInTheDocument();
      expect(screen.getByText('Updated')).toBeInTheDocument();
    });

    it('should show out-of-scope alert when requests exist', () => {
      mockUseRequestStats.mockReturnValue({
        stats: { ...mockRequestStats.stats, outOfScope: 3 },
        isLoading: false,
      });

      renderWithRouter();

      expect(screen.getByText(/out-of-scope request/)).toBeInTheDocument();
      // Review Requests button appears in both alert and quick actions
      const reviewButtons = screen.getAllByRole('button', { name: /Review Requests/i });
      expect(reviewButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('should not show out-of-scope alert when no requests', () => {
      mockUseRequestStats.mockReturnValue({
        stats: { ...mockRequestStats.stats, outOfScope: 0 },
        isLoading: false,
      });

      renderWithRouter();

      expect(screen.queryByText(/out-of-scope requests detected/)).not.toBeInTheDocument();
    });
  });
});

describe('Progress Calculations', () => {
  it('should calculate scope progress correctly', () => {
    const project = mockProject;
    const scopeProgress = project.scope_item_count > 0
      ? Math.round((project.completed_scope_count / project.scope_item_count) * 100)
      : 0;
    
    expect(scopeProgress).toBe(40); // 2/5 = 40%
  });

  it('should return 0 progress when no scope items', () => {
    const project = { ...mockProject, scope_item_count: 0, completed_scope_count: 0 };
    const scopeProgress = project.scope_item_count > 0
      ? Math.round((project.completed_scope_count / project.scope_item_count) * 100)
      : 0;
    
    expect(scopeProgress).toBe(0);
  });

  it('should calculate hours progress correctly', () => {
    const hoursPercent = mockScopeProgress.total_estimated_hours > 0
      ? Math.round((mockScopeProgress.completed_estimated_hours / mockScopeProgress.total_estimated_hours) * 100)
      : 0;
    
    expect(hoursPercent).toBe(40); // 16/40 = 40%
  });
});
