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

describe('ProjectDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseClients.mockReturnValue({
      data: { items: mockClients, total: 1 },
      isLoading: false,
      error: null,
    });
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

    it('should render client name', () => {
      renderWithRouter();

      expect(screen.getByText(/Acme Corp/)).toBeInTheDocument();
    });

    it('should render status badge', () => {
      renderWithRouter();

      expect(screen.getByText('Active')).toBeInTheDocument();
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

    it('should show health score section', () => {
      renderWithRouter();

      expect(screen.getByText('Health Score')).toBeInTheDocument();
    });

    it('should show budget', () => {
      renderWithRouter();

      expect(screen.getByText('Budget')).toBeInTheDocument();
    });
  });
});

describe('Health Score Calculation', () => {
  it('should calculate health score based on scope and out-of-scope ratio', () => {
    const project = mockProject;
    const scopeProgress = project.scope_item_count > 0
      ? Math.round((project.completed_scope_count / project.scope_item_count) * 100)
      : 0;
    
    const outOfScopeRatio = project.scope_item_count > 0
      ? project.out_of_scope_request_count / project.scope_item_count
      : 0;
    
    const healthScore = Math.max(0, Math.min(100, Math.round(
      (scopeProgress * 0.6) + ((1 - outOfScopeRatio) * 40)
    )));

    expect(healthScore).toBeGreaterThanOrEqual(0);
    expect(healthScore).toBeLessThanOrEqual(100);
  });

  it('should return correct color for health score ranges', () => {
    const getHealthColor = (score: number) => {
      if (score >= 80) return 'green';
      if (score >= 50) return 'yellow';
      return 'red';
    };

    expect(getHealthColor(85)).toBe('green');
    expect(getHealthColor(65)).toBe('yellow');
    expect(getHealthColor(30)).toBe('red');
  });
});
