import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';

// Mock the API
const mockGetByProject = vi.fn();
const mockGetById = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockAnalyze = vi.fn();

vi.mock('../../api/requests', () => ({
  requestsApi: {
    getByProject: (...args: unknown[]) => mockGetByProject(...args),
    getById: (...args: unknown[]) => mockGetById(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    update: (...args: unknown[]) => mockUpdate(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
    analyze: (...args: unknown[]) => mockAnalyze(...args),
  },
}));

vi.mock('../../api/proposals', () => ({
  proposalsApi: {
    create: vi.fn(),
  },
}));

vi.mock('../useProjects', () => ({
  projectKeys: {
    all: ['projects'],
    lists: () => ['projects', 'list'],
    detail: (id: string) => ['projects', 'detail', id],
  },
}));

import {
  useRequests,
  useRequest,
  useCreateRequest,
  useUpdateRequest,
  useDeleteRequest,
  useAnalyzeRequest,
  useRequestStats,
  requestKeys,
} from '../useRequests';

// Test wrapper
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
    project_id: 'proj-1',
    title: 'Add dark mode',
    content: 'Can you also add dark mode?',
    source: 'email',
    status: 'analyzed',
    classification: 'out_of_scope',
    confidence: 0.85,
    analysis_reasoning: 'Not in original scope',
    suggested_action: 'Create a proposal',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'req-2',
    project_id: 'proj-1',
    title: 'Update homepage copy',
    content: 'Please update the headline',
    source: 'email',
    status: 'analyzed',
    classification: 'in_scope',
    confidence: 0.92,
    analysis_reasoning: 'Matches scope item',
    suggested_action: 'Proceed with work',
    created_at: '2025-01-02T00:00:00Z',
    updated_at: '2025-01-02T00:00:00Z',
  },
  {
    id: 'req-3',
    project_id: 'proj-1',
    title: 'Old request',
    content: 'Already handled',
    source: 'chat',
    status: 'addressed',
    classification: 'in_scope',
    confidence: 0.90,
    analysis_reasoning: 'Was in scope',
    suggested_action: null,
    created_at: '2025-01-03T00:00:00Z',
    updated_at: '2025-01-03T00:00:00Z',
  },
  {
    id: 'req-4',
    project_id: 'proj-1',
    title: 'Dismissed request',
    content: 'Not relevant',
    source: 'meeting',
    status: 'declined',
    classification: 'out_of_scope',
    confidence: 0.70,
    analysis_reasoning: 'Out of scope',
    suggested_action: null,
    created_at: '2025-01-04T00:00:00Z',
    updated_at: '2025-01-04T00:00:00Z',
  },
  {
    id: 'req-5',
    project_id: 'proj-1',
    title: 'Unclear request',
    content: 'Something vague',
    source: 'call',
    status: 'analyzed',
    classification: 'clarification_needed',
    confidence: 0.50,
    analysis_reasoning: 'Need more details',
    suggested_action: 'Ask for clarification',
    created_at: '2025-01-05T00:00:00Z',
    updated_at: '2025-01-05T00:00:00Z',
  },
];

describe('requestKeys', () => {
  it('should generate correct query keys', () => {
    expect(requestKeys.all).toEqual(['requests']);
    expect(requestKeys.lists()).toEqual(['requests', 'list']);
    expect(requestKeys.list('proj-1', '{}')).toEqual(['requests', 'list', 'proj-1', '{}']);
    expect(requestKeys.details()).toEqual(['requests', 'detail']);
    expect(requestKeys.detail('proj-1', 'req-1')).toEqual(['requests', 'detail', 'proj-1', 'req-1']);
  });
});

describe('useRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch requests for a project', async () => {
    mockGetByProject.mockResolvedValue({ items: mockRequests, total: 5 });

    const { result } = renderHook(() => useRequests('proj-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetByProject).toHaveBeenCalledWith('proj-1');
    expect(result.current.data?.items).toHaveLength(5);
    expect(result.current.data?.allItems).toHaveLength(5);
  });

  it('should not fetch when projectId is empty', () => {
    renderHook(() => useRequests(''), {
      wrapper: createWrapper(),
    });

    expect(mockGetByProject).not.toHaveBeenCalled();
  });

  describe('filtering', () => {
    beforeEach(() => {
      mockGetByProject.mockResolvedValue({ items: mockRequests, total: 5 });
    });

    it('should filter active requests (exclude addressed/declined) when showActive is true', async () => {
      const { result } = renderHook(
        () => useRequests('proj-1', { showActive: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Should exclude addressed (req-3) and declined (req-4)
      expect(result.current.data?.items).toHaveLength(3);
      expect(result.current.data?.items.every(r => 
        r.status !== 'addressed' && r.status !== 'declined'
      )).toBe(true);
    });

    it('should filter by classification', async () => {
      const { result } = renderHook(
        () => useRequests('proj-1', { classification: 'out_of_scope' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(2); // req-1 and req-4
      expect(result.current.data?.items.every(r => 
        r.classification === 'out_of_scope'
      )).toBe(true);
    });

    it('should filter by status', async () => {
      const { result } = renderHook(
        () => useRequests('proj-1', { status: 'addressed' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.items[0].id).toBe('req-3');
    });

    it('should combine showActive and classification filters', async () => {
      const { result } = renderHook(
        () => useRequests('proj-1', { showActive: true, classification: 'out_of_scope' }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Only req-1 (out_of_scope and active)
      expect(result.current.data?.items).toHaveLength(1);
      expect(result.current.data?.items[0].id).toBe('req-1');
    });

    it('should preserve allItems regardless of filters', async () => {
      const { result } = renderHook(
        () => useRequests('proj-1', { showActive: true }),
        { wrapper: createWrapper() }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // allItems should contain everything
      expect(result.current.data?.allItems).toHaveLength(5);
    });
  });
});

describe('useRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch a single request', async () => {
    mockGetById.mockResolvedValue(mockRequests[0]);

    const { result } = renderHook(
      () => useRequest('proj-1', 'req-1'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockGetById).toHaveBeenCalledWith('proj-1', 'req-1');
    expect(result.current.data?.title).toBe('Add dark mode');
  });

  it('should not fetch when projectId is empty', () => {
    renderHook(() => useRequest('', 'req-1'), {
      wrapper: createWrapper(),
    });

    expect(mockGetById).not.toHaveBeenCalled();
  });

  it('should not fetch when requestId is empty', () => {
    renderHook(() => useRequest('proj-1', ''), {
      wrapper: createWrapper(),
    });

    expect(mockGetById).not.toHaveBeenCalled();
  });
});

describe('useCreateRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a request', async () => {
    const newRequest = {
      ...mockRequests[0],
      id: 'new-req',
      title: 'New request',
    };
    mockCreate.mockResolvedValue(newRequest);

    const { result } = renderHook(() => useCreateRequest(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      projectId: 'proj-1',
      data: {
        title: 'New request',
        content: 'Request content',
        source: 'email',
      },
    });

    expect(mockCreate).toHaveBeenCalledWith('proj-1', {
      title: 'New request',
      content: 'Request content',
      source: 'email',
    });
  });
});

describe('useUpdateRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update a request status', async () => {
    mockUpdate.mockResolvedValue({ ...mockRequests[0], status: 'addressed' });

    const { result } = renderHook(() => useUpdateRequest(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      projectId: 'proj-1',
      requestId: 'req-1',
      data: { status: 'addressed' },
    });

    expect(mockUpdate).toHaveBeenCalledWith('proj-1', 'req-1', { status: 'addressed' });
  });

  it('should update a request classification', async () => {
    mockUpdate.mockResolvedValue({ ...mockRequests[0], classification: 'in_scope' });

    const { result } = renderHook(() => useUpdateRequest(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      projectId: 'proj-1',
      requestId: 'req-1',
      data: { classification: 'in_scope' },
    });

    expect(mockUpdate).toHaveBeenCalledWith('proj-1', 'req-1', { classification: 'in_scope' });
  });
});

describe('useDeleteRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a request', async () => {
    mockDelete.mockResolvedValue(undefined);

    const { result } = renderHook(() => useDeleteRequest(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      projectId: 'proj-1',
      requestId: 'req-1',
    });

    expect(mockDelete).toHaveBeenCalledWith('proj-1', 'req-1');
  });
});

describe('useAnalyzeRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should trigger analysis for a request', async () => {
    mockAnalyze.mockResolvedValue({
      classification: 'out_of_scope',
      confidence: 0.85,
      reasoning: 'Not in scope',
      suggested_action: 'Create proposal',
    });

    const { result } = renderHook(() => useAnalyzeRequest(), {
      wrapper: createWrapper(),
    });

    await result.current.mutateAsync({
      projectId: 'proj-1',
      requestId: 'req-1',
    });

    expect(mockAnalyze).toHaveBeenCalledWith('proj-1', 'req-1');
  });
});

describe('useRequestStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate correct statistics', async () => {
    mockGetByProject.mockResolvedValue({ items: mockRequests, total: 5 });

    const { result } = renderHook(() => useRequestStats('proj-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const { stats } = result.current;

    expect(stats.total).toBe(5);
    expect(stats.active).toBe(3); // req-1, req-2, req-5 (not addressed/declined)
    expect(stats.addressed).toBe(1); // req-3
    expect(stats.declined).toBe(1); // req-4
    expect(stats.outOfScope).toBe(1); // req-1 (only active out_of_scope)
    expect(stats.inScope).toBe(1); // req-2 (only active in_scope)
    expect(stats.clarificationNeeded).toBe(1); // req-5
  });

  it('should return zero stats for empty data', async () => {
    mockGetByProject.mockResolvedValue({ items: [], total: 0 });

    const { result } = renderHook(() => useRequestStats('proj-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const { stats } = result.current;

    expect(stats.total).toBe(0);
    expect(stats.active).toBe(0);
    expect(stats.addressed).toBe(0);
    expect(stats.declined).toBe(0);
    expect(stats.outOfScope).toBe(0);
    expect(stats.inScope).toBe(0);
    expect(stats.clarificationNeeded).toBe(0);
  });

  it('should handle null/undefined data gracefully', async () => {
    mockGetByProject.mockResolvedValue({ items: null, total: 0 });

    const { result } = renderHook(() => useRequestStats('proj-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const { stats } = result.current;
    expect(stats.total).toBe(0);
  });
});
