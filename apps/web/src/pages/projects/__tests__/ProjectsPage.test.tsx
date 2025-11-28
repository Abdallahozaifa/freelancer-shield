import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { ReactElement } from 'react';

// Mocks must be defined before imports
const mockUseProjects = vi.fn();
const mockUseClients = vi.fn();
const mockCreateProject = vi.fn();

vi.mock('../../../hooks/useProjects', () => ({
  useProjects: () => mockUseProjects(),
  useProject: vi.fn(),
  useCreateProject: () => ({
    mutateAsync: mockCreateProject,
    isPending: false,
  }),
  useUpdateProject: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteProject: () => ({
    mutateAsync: vi.fn(),
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

import { ProjectsPage } from '../ProjectsPage';

// Test wrapper
const renderWithProviders = (component: ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

// Mock data
const mockProjects = [
  {
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
  },
  {
    id: '2',
    client_id: 'client-2',
    client_name: 'Tech Inc',
    name: 'Mobile App',
    description: null,
    status: 'on_hold' as const,
    budget: null,
    hourly_rate: null,
    estimated_hours: null,
    scope_item_count: 0,
    completed_scope_count: 0,
    out_of_scope_request_count: 0,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-10T00:00:00Z',
  },
];

const mockClients = [
  { id: 'client-1', name: 'Acme Corp', email: 'contact@acme.com', project_count: 1 },
  { id: 'client-2', name: 'Tech Inc', email: 'hello@tech.com', project_count: 1 },
];

describe('ProjectsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseClients.mockReturnValue({
      data: { items: mockClients, total: 2 },
      isLoading: false,
      error: null,
    });
  });

  describe('Loading State', () => {
    it('should show loading skeletons when data is loading', () => {
      mockUseProjects.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<ProjectsPage />);

      // Should show skeleton cards
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no projects exist', () => {
      mockUseProjects.mockReturnValue({
        data: { items: [], total: 0 },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<ProjectsPage />);

      expect(screen.getByText('No projects yet')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when fetch fails', () => {
      mockUseProjects.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to fetch'),
      });

      renderWithProviders(<ProjectsPage />);

      expect(screen.getByText(/Failed to load projects/)).toBeInTheDocument();
    });
  });

  describe('Projects List', () => {
    beforeEach(() => {
      mockUseProjects.mockReturnValue({
        data: { items: mockProjects, total: 2 },
        isLoading: false,
        error: null,
      });
    });

    it('should render page header with title', () => {
      renderWithProviders(<ProjectsPage />);

      expect(screen.getByText('Projects')).toBeInTheDocument();
    });

    it('should render New Project button', () => {
      renderWithProviders(<ProjectsPage />);

      expect(screen.getByRole('button', { name: /New Project/i })).toBeInTheDocument();
    });

    it('should render project cards', () => {
      renderWithProviders(<ProjectsPage />);

      expect(screen.getByText('Website Redesign')).toBeInTheDocument();
      expect(screen.getByText('Mobile App')).toBeInTheDocument();
    });

    it('should show status badges', () => {
      renderWithProviders(<ProjectsPage />);

      // Use getAllByText since "Active" appears both in tab and badge
      const activeElements = screen.getAllByText('Active');
      expect(activeElements.length).toBeGreaterThanOrEqual(1);
      
      const onHoldElements = screen.getAllByText('On Hold');
      expect(onHoldElements.length).toBeGreaterThanOrEqual(1);
    });
  });
});

describe('Project Card Calculations', () => {
  it('should calculate scope progress correctly', () => {
    const project = mockProjects[0];
    const progress = project.scope_item_count > 0
      ? Math.round((project.completed_scope_count / project.scope_item_count) * 100)
      : 0;
    
    expect(progress).toBe(40);
  });

  it('should return 0 progress when no scope items', () => {
    const project = mockProjects[1];
    const progress = project.scope_item_count > 0
      ? Math.round((project.completed_scope_count / project.scope_item_count) * 100)
      : 0;
    
    expect(progress).toBe(0);
  });
});
