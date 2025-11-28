import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { ReactNode } from 'react';

// Mock the API client
vi.mock('../../api/clients', () => ({
  clientsApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { clientsApi } from '../../api/clients';
import {
  useClients,
  useClient,
  useCreateClient,
  useUpdateClient,
  useDeleteClient,
} from '../useClients';

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
const mockClients = [
  {
    id: 'client-1',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    company: 'Acme Corporation',
    notes: 'Important client',
    project_count: 2,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-15T00:00:00Z',
  },
  {
    id: 'client-2',
    name: 'Tech Inc',
    email: 'hello@tech.com',
    company: 'Technology Inc',
    notes: null,
    project_count: 1,
    created_at: '2025-02-01T00:00:00Z',
    updated_at: '2025-02-10T00:00:00Z',
  },
];

describe('useClients Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useClients', () => {
    it('should fetch all clients successfully', async () => {
      vi.mocked(clientsApi.getAll).mockResolvedValue({
        items: mockClients,
        total: 2,
      });

      const { result } = renderHook(() => useClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.items).toHaveLength(2);
      expect(result.current.data?.items[0].name).toBe('Acme Corp');
    });

    it('should handle fetch error', async () => {
      vi.mocked(clientsApi.getAll).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useClients(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeDefined();
    });
  });

  describe('useClient', () => {
    it('should fetch a single client by id', async () => {
      vi.mocked(clientsApi.getById).mockResolvedValue(mockClients[0]);

      const { result } = renderHook(() => useClient('client-1'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.name).toBe('Acme Corp');
      expect(clientsApi.getById).toHaveBeenCalledWith('client-1');
    });

    it('should not fetch when id is empty', async () => {
      const { result } = renderHook(() => useClient(''), {
        wrapper: createWrapper(),
      });

      expect(result.current.isFetching).toBe(false);
      expect(clientsApi.getById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateClient', () => {
    it('should create a client successfully', async () => {
      const newClient = {
        ...mockClients[0],
        id: 'client-3',
        name: 'New Client',
      };
      vi.mocked(clientsApi.create).mockResolvedValue(newClient);

      const { result } = renderHook(() => useCreateClient(), {
        wrapper: createWrapper(),
      });

      const createData = {
        name: 'New Client',
        email: 'new@client.com',
      };

      await result.current.mutateAsync(createData);

      expect(clientsApi.create).toHaveBeenCalledWith(createData);
    });

    it('should handle create error', async () => {
      vi.mocked(clientsApi.create).mockRejectedValue(new Error('Create failed'));

      const { result } = renderHook(() => useCreateClient(), {
        wrapper: createWrapper(),
      });

      await expect(
        result.current.mutateAsync({ name: 'New Client' })
      ).rejects.toThrow('Create failed');
    });
  });

  describe('useUpdateClient', () => {
    it('should update a client successfully', async () => {
      const updatedClient = { ...mockClients[0], name: 'Updated Name' };
      vi.mocked(clientsApi.update).mockResolvedValue(updatedClient);

      const { result } = renderHook(() => useUpdateClient(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync({
        id: 'client-1',
        data: { name: 'Updated Name' },
      });

      expect(clientsApi.update).toHaveBeenCalledWith('client-1', { name: 'Updated Name' });
    });
  });

  describe('useDeleteClient', () => {
    it('should delete a client successfully', async () => {
      vi.mocked(clientsApi.delete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteClient(), {
        wrapper: createWrapper(),
      });

      await result.current.mutateAsync('client-1');

      expect(clientsApi.delete).toHaveBeenCalledWith('client-1');
    });
  });
});

describe('Client Data Validation', () => {
  it('should have required fields in client object', () => {
    const client = mockClients[0];
    
    expect(client).toHaveProperty('id');
    expect(client).toHaveProperty('name');
    expect(client).toHaveProperty('email');
    expect(client).toHaveProperty('project_count');
    expect(client).toHaveProperty('created_at');
    expect(client).toHaveProperty('updated_at');
  });

  it('should have non-negative project_count', () => {
    mockClients.forEach(client => {
      expect(client.project_count).toBeGreaterThanOrEqual(0);
    });
  });
});
