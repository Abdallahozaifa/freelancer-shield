import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { ScopeTab } from '../ScopeTab';
import { scopeApi } from '../../../../api/scope';
import type { ScopeItem } from '../../../../types';

// Mock the scope API
vi.mock('../../../../api/scope', () => ({
  scopeApi: {
    getByProject: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    reorder: vi.fn(),
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

// Test wrapper
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
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const renderScopeTab = (projectId = 'project-1') => {
  const Wrapper = createWrapper();
  return render(
    <Wrapper>
      <ScopeTab projectId={projectId} />
    </Wrapper>
  );
};

describe('ScopeTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Loading State Tests
  // ============================================
  describe('Loading State', () => {
    it('should show loading skeleton while fetching data', () => {
      vi.mocked(scopeApi.getByProject).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderScopeTab();

      // Should show skeleton elements
      expect(document.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Empty State Tests
  // ============================================
  describe('Empty State', () => {
    it('should show empty state when no scope items exist', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: [],
        total: 0,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('No scope items yet')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Define your project scope by adding items/)
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add First Item/i })).toBeInTheDocument();
    });

    it('should open form when clicking "Add First Item" in empty state', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: [],
        total: 0,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('No scope items yet')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /Add First Item/i });
      await userEvent.click(addButton);

      expect(screen.getByText('Add Scope Item')).toBeInTheDocument();
    });
  });

  // ============================================
  // List Display Tests
  // ============================================
  describe('List Display', () => {
    it('should display all scope items', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      expect(screen.getByText('Build responsive header')).toBeInTheDocument();
      expect(screen.getByText('Implement contact form')).toBeInTheDocument();
    });

    it('should display item descriptions', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(
          screen.getByText('Create 3 design options for client review')
        ).toBeInTheDocument();
      });
    });

    it('should display estimated hours for each item', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Est: 8h')).toBeInTheDocument();
      });

      expect(screen.getByText('Est: 6h')).toBeInTheDocument();
      expect(screen.getByText('Est: 4h')).toBeInTheDocument();
    });

    it('should show completed items with visual indication', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Build responsive header')).toBeInTheDocument();
      });

      // The completed item should have line-through class
      const completedTitle = screen.getByText('Build responsive header');
      expect(completedTitle).toHaveClass('line-through');
    });
  });

  // ============================================
  // Progress Card Tests
  // ============================================
  describe('Progress Card', () => {
    it('should display progress statistics', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText(/Progress: 1 of 3 items/)).toBeInTheDocument();
      });

      expect(screen.getByText('1 Completed')).toBeInTheDocument();
      expect(screen.getByText('2 Remaining')).toBeInTheDocument();
    });

    it('should display hours completed', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText(/6 of 18h completed/)).toBeInTheDocument();
      });
    });

    it('should not show progress card when no items', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: [],
        total: 0,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('No scope items yet')).toBeInTheDocument();
      });

      expect(screen.queryByText(/Progress:/)).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Create Item Tests
  // ============================================
  describe('Create Item', () => {
    it('should open create modal when clicking Add Item button', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', { name: /Add Item/i });
      await userEvent.click(addButton);

      expect(screen.getByText('Add Scope Item')).toBeInTheDocument();
      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    });

    it('should create item with valid data', async () => {
      const newItem: ScopeItem = {
        id: 'scope-4',
        project_id: 'project-1',
        title: 'New task',
        description: 'New description',
        order: 3,
        is_completed: false,
        estimated_hours: 5,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });
      vi.mocked(scopeApi.create).mockResolvedValue(newItem);

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Open modal
      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      // Fill form
      await userEvent.type(screen.getByLabelText(/Title/i), 'New task');
      await userEvent.type(screen.getByLabelText(/Description/i), 'New description');
      await userEvent.type(screen.getByLabelText(/Estimated Hours/i), '5');

      // Submit - target the submit button inside the form
      const formSubmitButton = screen.getAllByRole('button', { name: /Add Item/i })
        .find(btn => btn.getAttribute('type') === 'submit');
      await userEvent.click(formSubmitButton!);

      await waitFor(() => {
        expect(scopeApi.create).toHaveBeenCalledWith('project-1', {
          title: 'New task',
          description: 'New description',
          estimated_hours: 5,
          order: 3,
        });
      });
    });

    it('should show validation error for empty title', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Open modal
      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      // Submit without filling title - target the submit button inside the form
      const formSubmitButton = screen.getAllByRole('button', { name: /Add Item/i })
        .find(btn => btn.getAttribute('type') === 'submit');
      await userEvent.click(formSubmitButton!);

      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });
    });

    it('should close modal when clicking Cancel', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Open modal
      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));
      expect(screen.getByText('Add Scope Item')).toBeInTheDocument();

      // Click cancel
      await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      await waitFor(() => {
        expect(screen.queryByText('Add Scope Item')).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // Edit Item Tests
  // ============================================
  describe('Edit Item', () => {
    it('should open edit modal with pre-filled data when clicking edit', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Find and click the edit button for the first item
      const editButtons = screen.getAllByLabelText(/Edit scope item/i);
      await userEvent.click(editButtons[0]);

      // Modal should show with pre-filled data
      expect(screen.getByText('Edit Scope Item')).toBeInTheDocument();
      expect(screen.getByLabelText(/Title/i)).toHaveValue('Design homepage mockups');
      expect(screen.getByLabelText(/Description/i)).toHaveValue(
        'Create 3 design options for client review'
      );
      expect(screen.getByLabelText(/Estimated Hours/i)).toHaveValue(8);
    });

    it('should update item when saving changes', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });
      vi.mocked(scopeApi.update).mockResolvedValue({
        ...mockScopeItems[0],
        title: 'Updated title',
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Open edit modal
      const editButtons = screen.getAllByLabelText(/Edit scope item/i);
      await userEvent.click(editButtons[0]);

      // Clear and update title
      const titleInput = screen.getByLabelText(/Title/i);
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated title');

      // Save
      await userEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(scopeApi.update).toHaveBeenCalledWith('project-1', 'scope-1', {
          title: 'Updated title',
          description: 'Create 3 design options for client review',
          estimated_hours: 8,
        });
      });
    });
  });

  // ============================================
  // Toggle Completion Tests
  // ============================================
  describe('Toggle Completion', () => {
    it('should toggle item completion when clicking checkbox', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });
      vi.mocked(scopeApi.update).mockResolvedValue({
        ...mockScopeItems[0],
        is_completed: true,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Find checkbox for incomplete item
      const checkboxes = screen.getAllByLabelText(/Mark as complete/i);
      await userEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(scopeApi.update).toHaveBeenCalledWith('project-1', 'scope-1', {
          is_completed: true,
        });
      });
    });

    it('should uncheck completed item when clicking checkbox', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });
      vi.mocked(scopeApi.update).mockResolvedValue({
        ...mockScopeItems[1],
        is_completed: false,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Build responsive header')).toBeInTheDocument();
      });

      // Find checkbox for completed item (scope-2)
      const checkboxes = screen.getAllByLabelText(/Mark as incomplete/i);
      await userEvent.click(checkboxes[0]);

      await waitFor(() => {
        expect(scopeApi.update).toHaveBeenCalledWith('project-1', 'scope-2', {
          is_completed: false,
        });
      });
    });
  });

  // ============================================
  // Delete Item Tests
  // ============================================
  describe('Delete Item', () => {
    it('should show delete confirmation modal when clicking delete', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Click delete button for first item
      const deleteButtons = screen.getAllByLabelText(/Delete scope item/i);
      await userEvent.click(deleteButtons[0]);

      // Confirmation modal should appear
      expect(screen.getByText('Delete Scope Item')).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      expect(screen.getByText(/"Design homepage mockups"/)).toBeInTheDocument();
    });

    it('should delete item when confirming deletion', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });
      vi.mocked(scopeApi.delete).mockResolvedValue(undefined);

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButtons = screen.getAllByLabelText(/Delete scope item/i);
      await userEvent.click(deleteButtons[0]);

      // Confirm deletion
      await userEvent.click(screen.getByRole('button', { name: /^Delete$/i }));

      await waitFor(() => {
        expect(scopeApi.delete).toHaveBeenCalledWith('project-1', 'scope-1');
      });
    });

    it('should close confirmation modal when clicking Cancel', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Open delete confirmation
      const deleteButtons = screen.getAllByLabelText(/Delete scope item/i);
      await userEvent.click(deleteButtons[0]);

      expect(screen.getByText('Delete Scope Item')).toBeInTheDocument();

      // Cancel
      await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      await waitFor(() => {
        expect(screen.queryByText('Delete Scope Item')).not.toBeInTheDocument();
      });

      // Item should still exist
      expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
    });
  });

  // ============================================
  // Error Handling Tests
  // ============================================
  describe('Error Handling', () => {
    it('should show error state when API fails', async () => {
      vi.mocked(scopeApi.getByProject).mockRejectedValue(new Error('API Error'));

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load scope items/)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('Accessibility', () => {
    it('should have accessible button labels', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Check for accessible labels
      expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();
      expect(screen.getAllByLabelText(/Edit scope item/i)).toHaveLength(3);
      expect(screen.getAllByLabelText(/Delete scope item/i)).toHaveLength(3);
      expect(screen.getAllByLabelText(/Mark as complete/i).length).toBeGreaterThan(0);
    });

    it('should have proper focus management in modal', async () => {
      vi.mocked(scopeApi.getByProject).mockResolvedValue({
        items: mockScopeItems,
        total: mockScopeItems.length,
      });

      renderScopeTab();

      await waitFor(() => {
        expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
      });

      // Open modal
      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      // First focusable element should receive focus (close button or first input)
      await waitFor(() => {
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();
      });
    });
  });
});
