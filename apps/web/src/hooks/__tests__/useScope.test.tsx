import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useScopeItems,
  useScopeProgress,
  useCreateScopeItem,
  useUpdateScopeItem,
  useDeleteScopeItem,
  useReorderScopeItems,
} from '../useScope';
import { scopeApi } from '../../api/scope';
import type { ScopeItem } from '../../types';

// Mock the scope API
vi.mock('../../api/scope', () => ({
  scopeApi: {
    getByProject: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
    getProgress: vi.fn(),
  },
}));

// Mock data
const mockScopeItems: ScopeItem[] = [
  {
    id: 'scope-1',
    project_id: 'project-1',
    title: 'Design homepage mockups',
    description: 'Create 3 design options for client review',
    order: 0,
    is_completed: false,
    estimated_hours: 8,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'scope-2',
    project_id: 'project-1',
    title: 'Build responsive header',
    description: 'Navigation, logo, mobile menu',
    order: 1,
    is_completed: true,
    estimated_hours: 6,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'scope-3',
    project_id: 'project-1',
    title: 'Implement contact form',
    description: 'Form validation, email sending',
    order: 2,
    is_completed: false,
    estimated_hours: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useScope hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // ============================================
  // useScopeItems Tests
  // ============================================
  describe('useScopeItems', () => {
    it('should fetch scope items for a project', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      const { result } = renderHook(() => useScopeItems('project-1'), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toHaveLength(3);
      expect(scopeApi.getByProject).toHaveBeenCalledWith('project-1');
    });

    it('should return items sorted by order', async () => {
      const unsortedItems = [
        { ...mockScopeItems[2], order: 2 },
        { ...mockScopeItems[0], order: 0 },
        { ...mockScopeItems[1], order: 1 },
      ];

      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: unsortedItems,
        total: unsortedItems.length,
      });

      const { result } = renderHook(() => useScopeItems('project-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.[0].order).toBe(0);
      expect(result.current.data?.[1].order).toBe(1);
      expect(result.current.data?.[2].order).toBe(2);
    });

    it('should not fetch when projectId is empty', async () => {
      const { result } = renderHook(() => useScopeItems(''), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.fetchStatus).toBe('idle');
      });

      expect(scopeApi.getByProject).not.toHaveBeenCalled();
    });

    it('should handle API errors', async () => {
      vi.mocked(scopeApi.getByProject).mockRejectedValue(new Error('API Error'));

      const { result } = renderHook(() => useScopeItems('project-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================
  // useScopeProgress Tests
  // ============================================
  describe('useScopeProgress', () => {
    it('should calculate progress from scope items', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      const { result } = renderHook(() => useScopeProgress('project-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        total_items: 3,
        completed_items: 1, // Only scope-2 is completed
        completion_percentage: 33, // 1/3 = 33%
        total_estimated_hours: 18, // 8 + 6 + 4
        completed_estimated_hours: 6, // Only scope-2's hours
      });
    });

    it('should return 0% for empty items', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: [],
        total: 0,
      });

      const { result } = renderHook(() => useScopeProgress('project-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({
        total_items: 0,
        completed_items: 0,
        completion_percentage: 0,
        total_estimated_hours: null,
        completed_estimated_hours: null,
      });
    });

    it('should handle items without estimated hours', async () => {
      const itemsWithoutHours: ScopeItem[] = [
        { ...mockScopeItems[0], estimated_hours: null },
        { ...mockScopeItems[1], estimated_hours: null },
      ];

      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: itemsWithoutHours,
        total: itemsWithoutHours.length,
      });

      const { result } = renderHook(() => useScopeProgress('project-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.total_estimated_hours).toBe(0);
    });

    it('should calculate 100% when all items completed', async () => {
      const allCompleted = mockScopeItems.map((item) => ({
        ...item,
        is_completed: true,
      }));

      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: allCompleted,
        total: allCompleted.length,
      });

      const { result } = renderHook(() => useScopeProgress('project-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.completion_percentage).toBe(100);
      expect(result.current.data?.completed_estimated_hours).toBe(18);
    });
  });

  // ============================================
  // useCreateScopeItem Tests
  // ============================================
  describe('useCreateScopeItem', () => {
    it('should create a new scope item', async () => {
      const newItem: ScopeItem = {
        id: 'scope-4',
        project_id: 'project-1',
        title: 'New scope item',
        description: 'Description',
        order: 3,
        is_completed: false,
        estimated_hours: 10,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(scopeApi.create).mockResolvedValue(newItem);

      const { result } = renderHook(() => useCreateScopeItem(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          projectId: 'project-1',
          data: {
            title: 'New scope item',
            description: 'Description',
            estimated_hours: 10,
          },
        });
      });

      expect(scopeApi.create).toHaveBeenCalledWith('project-1', {
        title: 'New scope item',
        description: 'Description',
        estimated_hours: 10,
      });
    });

    it('should handle creation errors', async () => {
      vi.mocked(scopeApi.create).mockRejectedValue(new Error('Creation failed'));

      const { result } = renderHook(() => useCreateScopeItem(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            projectId: 'project-1',
            data: { title: 'Test' },
          });
        })
      ).rejects.toThrow('Creation failed');
    });
  });

  // ============================================
  // useUpdateScopeItem Tests
  // ============================================
  describe('useUpdateScopeItem', () => {
    it('should update a scope item', async () => {
      const updatedItem = { ...mockScopeItems[0], title: 'Updated title' };
      vi.mocked(scopeApi.update).mockResolvedValue(updatedItem);

      const { result } = renderHook(() => useUpdateScopeItem(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          projectId: 'project-1',
          itemId: 'scope-1',
          data: { title: 'Updated title' },
        });
      });

      expect(scopeApi.update).toHaveBeenCalledWith('project-1', 'scope-1', {
        title: 'Updated title',
      });
    });

    it('should toggle completion status', async () => {
      const completedItem = { ...mockScopeItems[0], is_completed: true };
      vi.mocked(scopeApi.update).mockResolvedValue(completedItem);

      const { result } = renderHook(() => useUpdateScopeItem(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          projectId: 'project-1',
          itemId: 'scope-1',
          data: { is_completed: true },
        });
      });

      expect(scopeApi.update).toHaveBeenCalledWith('project-1', 'scope-1', {
        is_completed: true,
      });
    });
  });

  // ============================================
  // useDeleteScopeItem Tests
  // ============================================
  describe('useDeleteScopeItem', () => {
    it('should delete a scope item', async () => {
      vi.mocked(scopeApi.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteScopeItem(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          projectId: 'project-1',
          itemId: 'scope-1',
        });
      });

      expect(scopeApi.delete).toHaveBeenCalledWith('project-1', 'scope-1');
    });

    it('should handle deletion errors', async () => {
      vi.mocked(scopeApi.delete).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useDeleteScopeItem(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            projectId: 'project-1',
            itemId: 'scope-1',
          });
        })
      ).rejects.toThrow('Delete failed');
    });
  });

  // ============================================
  // useReorderScopeItems Tests
  // ============================================
  describe('useReorderScopeItems', () => {
    it('should reorder scope items', async () => {
      const reorderedItems = [
        { ...mockScopeItems[2], order: 0 },
        { ...mockScopeItems[0], order: 1 },
        { ...mockScopeItems[1], order: 2 },
      ];

      vi.mocked(scopeApi.reorder).mockResolvedValue(reorderedItems);

      const { result } = renderHook(() => useReorderScopeItems(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          projectId: 'project-1',
          itemIds: ['scope-3', 'scope-1', 'scope-2'],
        });
      });

      expect(scopeApi.reorder).toHaveBeenCalledWith('project-1', [
        'scope-3',
        'scope-1',
        'scope-2',
      ]);
    });
  });
});
