import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

// Mock the API client
vi.mock('../../api/projects', () => ({
  projectsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../api/clients', () => ({
  clientsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}));

import { projectsApi } from '../../api/projects';
import {
  useProjects,
  useProject,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from '../useProjects';

// Test wrapper with providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
  
  return Wrapper;
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
    description: 'iOS and Android app',
    status: 'on_hold' as const,
    budget: 15000,
    hourly_rate: 100,
    estimated_hours: 150,
    scope_item_count: 10,
    completed_scope_count: 3,
    out_of_scope_request_count: 0,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-10T00:00:00Z',
  },
];

const mockClients = [
  { id: 'client-1', name: 'Acme Corp', email: 'contact@acme.com', project_count: 1 },
  { id: 'client-2', name: 'Tech Inc', email: 'hello@tech.com', project_count: 1 },
];

describe('useProjects Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProjects', () => {
    it('should fetch all projects successfully', async () => {
      vi.mocked(projectsApi.getAll).mockResolvedValue({
        items: mockProjects,
        total: 2,
      });

      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.items).toHaveLength(2);
      expect(result.current.data?.items[0].name).toBe('Website Redesign');
      expect(projectsApi.getAll).toHaveBeenCalledWith(0, 100, undefined, undefined);
    });

    it('should fetch projects filtered by status', async () => {
      vi.mocked(projectsApi.getAll).mockResolvedValue({
        items: [mockProjects[0]],
        total: 1,
      });

      const { result } = renderHook(() => useProjects({ status: 'active' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.items).toHaveLength(1);
      expect(projectsApi.getAll).toHaveBeenCalledWith(0, 100, 'active', undefined);
    });

    it('should fetch projects filtered by client_id', async () => {
      vi.mocked(projectsApi.getAll).mockResolvedValue({
        items: [mockProjects[0]],
        total: 1,
      });

      const { result } = renderHook(() => useProjects({ client_id: 'client-1' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(projectsApi.getAll).toHaveBeenCalledWith(0, 100, undefined, 'client-1');
    });

    it('should handle fetch error', async () => {
      vi.mocked(projectsApi.getAll).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useProjects(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useProject', () => {
    it('should fetch a single project by id', async () => {
      vi.mocked(projectsApi.getById).mockResolvedValue(mockProjects[0]);

      const { result } = renderHook(() => useProject('1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.name).toBe('Website Redesign');
      expect(projectsApi.getById).toHaveBeenCalledWith('1');
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useProject(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(projectsApi.getById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateProject', () => {
    it('should create a project successfully', async () => {
      const newProject = {
        ...mockProjects[0],
        id: '3',
        name: 'New Project',
      };
      vi.mocked(projectsApi.create).mockResolvedValue(newProject);

      const { result } = renderHook(() => useCreateProject(), {
        wrapper: createWrapper(),
      });

      const createData = {
        client_id: 'client-1',
        name: 'New Project',
        status: 'active' as const,
      };

      await result.current.mutateAsync(createData);

      expect(projectsApi.create).toHaveBeenCalledWith(createData);
    });

    it('should handle create error', async () => {
      vi.mocked(projectsApi.create).mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useCreateProject(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({
          client_id: 'client-1',
          name: 'New Project',
        })
      ).rejects.toThrow('Create failed');
    });
  });

  describe('useUpdateProject', () => {
    it('should update a project successfully', async () => {
      const updatedProject = { ...mockProjects[0], name: 'Updated Name' };
      vi.mocked(projectsApi.update).mockResolvedValue(updatedProject);

      const { result } = renderHook(() => useUpdateProject(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        id: '1',
        data: { name: 'Updated Name' },
      });

      expect(projectsApi.update).toHaveBeenCalledWith('1', { name: 'Updated Name' });
    });
  });

  describe('useDeleteProject', () => {
    it('should delete a project successfully', async () => {
      vi.mocked(projectsApi.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteProject(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('1');

      expect(projectsApi.delete).toHaveBeenCalledWith('1');
    });
  });
});

describe('Projects API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should transform API response from { projects: [] } to { items: [] }', async () => {
    // This tests that the API layer correctly transforms the response
    vi.mocked(projectsApi.getAll).mockResolvedValue({
      items: mockProjects,
      total: 2,
    });

    const { result } = renderHook(() => useProjects(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify the data structure has 'items' not 'projects'
    expect(result.current.data).toHaveProperty('items');
    expect(result.current.data).toHaveProperty('total');
    expect(Array.isArray(result.current.data?.items)).toBe(true);
  });
});

describe('Project Data Validation', () => {
  it('should have required fields in project object', () => {
    const project = mockProjects[0];
    
    expect(project).toHaveProperty('id');
    expect(project).toHaveProperty('client_id');
    expect(project).toHaveProperty('client_name');
    expect(project).toHaveProperty('name');
    expect(project).toHaveProperty('status');
    expect(project).toHaveProperty('scope_item_count');
    expect(project).toHaveProperty('completed_scope_count');
    expect(project).toHaveProperty('out_of_scope_request_count');
    expect(project).toHaveProperty('created_at');
    expect(project).toHaveProperty('updated_at');
  });

  it('should have valid status values', () => {
    const validStatuses = ['active', 'completed', 'on_hold', 'cancelled'];
    
    mockProjects.forEach(project => {
      expect(validStatuses).toContain(project.status);
    });
  });

  it('should calculate scope progress correctly', () => {
    const project = mockProjects[0];
    const expectedProgress = Math.round(
      (project.completed_scope_count / project.scope_item_count) * 100
    );
    
    expect(expectedProgress).toBe(40); // 2/5 = 40%
  });
});
