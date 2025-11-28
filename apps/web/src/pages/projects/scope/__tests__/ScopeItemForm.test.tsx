import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ScopeItemForm } from '../ScopeItemForm';
import type { ScopeItem } from '../../../../types';

// Mock react-hook-form to avoid issues
vi.mock('react-hook-form', async () => {
  const actual = await vi.importActual('react-hook-form');
  return actual;
});

const mockItem: ScopeItem = {
  id: 'scope-1',
  project_id: 'project-1',
  title: 'Design homepage mockups',
  description: 'Create 3 design options for client review',
  order: 0,
  is_completed: false,
  estimated_hours: 8,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

describe('ScopeItemForm', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Create Mode Tests
  // ============================================
  describe('Create Mode', () => {
    it('should render with "Add Scope Item" title', () => {
      render(<ScopeItemForm {...defaultProps} />);
      expect(screen.getByText('Add Scope Item')).toBeInTheDocument();
    });

    it('should render empty form fields', () => {
      render(<ScopeItemForm {...defaultProps} />);

      expect(screen.getByLabelText(/Title/i)).toHaveValue('');
      expect(screen.getByLabelText(/Description/i)).toHaveValue('');
      expect(screen.getByLabelText(/Estimated Hours/i)).toHaveValue(null);
    });

    it('should render "Add Item" submit button', () => {
      render(<ScopeItemForm {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();
    });

    it('should submit form with entered data', async () => {
      const onSubmit = vi.fn();
      render(<ScopeItemForm {...defaultProps} onSubmit={onSubmit} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'New task');
      await userEvent.type(screen.getByLabelText(/Description/i), 'Task description');
      await userEvent.type(screen.getByLabelText(/Estimated Hours/i), '5');

      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          title: 'New task',
          description: 'Task description',
          estimated_hours: 5,
        });
      });
    });

    it('should submit with null description when empty', async () => {
      const onSubmit = vi.fn();
      render(<ScopeItemForm {...defaultProps} onSubmit={onSubmit} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'New task');
      // Leave description empty

      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            description: null,
          })
        );
      });
    });

    it('should submit with null hours when empty', async () => {
      const onSubmit = vi.fn();
      render(<ScopeItemForm {...defaultProps} onSubmit={onSubmit} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'New task');
      // Leave hours empty

      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            estimated_hours: null,
          })
        );
      });
    });
  });

  // ============================================
  // Edit Mode Tests
  // ============================================
  describe('Edit Mode', () => {
    it('should render with "Edit Scope Item" title', () => {
      render(<ScopeItemForm {...defaultProps} item={mockItem} />);
      expect(screen.getByText('Edit Scope Item')).toBeInTheDocument();
    });

    it('should pre-fill form with item data', () => {
      render(<ScopeItemForm {...defaultProps} item={mockItem} />);

      expect(screen.getByLabelText(/Title/i)).toHaveValue('Design homepage mockups');
      expect(screen.getByLabelText(/Description/i)).toHaveValue(
        'Create 3 design options for client review'
      );
      expect(screen.getByLabelText(/Estimated Hours/i)).toHaveValue(8);
    });

    it('should render "Save Changes" submit button', () => {
      render(<ScopeItemForm {...defaultProps} item={mockItem} />);
      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    it('should submit updated data', async () => {
      const onSubmit = vi.fn();
      render(<ScopeItemForm {...defaultProps} item={mockItem} onSubmit={onSubmit} />);

      const titleInput = screen.getByLabelText(/Title/i);
      await userEvent.clear(titleInput);
      await userEvent.type(titleInput, 'Updated title');

      await userEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Updated title',
          })
        );
      });
    });

    it('should handle item with null description', () => {
      const itemWithoutDescription = { ...mockItem, description: null };
      render(<ScopeItemForm {...defaultProps} item={itemWithoutDescription} />);

      expect(screen.getByLabelText(/Description/i)).toHaveValue('');
    });

    it('should handle item with null hours', () => {
      const itemWithoutHours = { ...mockItem, estimated_hours: null };
      render(<ScopeItemForm {...defaultProps} item={itemWithoutHours} />);

      expect(screen.getByLabelText(/Estimated Hours/i)).toHaveValue(null);
    });
  });

  // ============================================
  // Validation Tests
  // ============================================
  describe('Validation', () => {
    it('should show error when title is empty', async () => {
      render(<ScopeItemForm {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });
    });

    it('should show error when title is too short', async () => {
      render(<ScopeItemForm {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'A');
      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      await waitFor(() => {
        expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error for negative hours', async () => {
      render(<ScopeItemForm {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'Valid title');
      await userEvent.clear(screen.getByLabelText(/Estimated Hours/i));
      await userEvent.type(screen.getByLabelText(/Estimated Hours/i), '-5');
      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      // The form uses min="0" on the input, so negative values should be prevented
      // or show a validation error - check that onSubmit wasn't called with invalid data
      await waitFor(() => {
        expect(defaultProps.onSubmit).not.toHaveBeenCalled();
      });
    });

    it('should not submit when validation fails', async () => {
      const onSubmit = vi.fn();
      render(<ScopeItemForm {...defaultProps} onSubmit={onSubmit} />);

      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should clear errors when valid input is provided', async () => {
      render(<ScopeItemForm {...defaultProps} />);

      // Trigger validation error
      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));
      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });

      // Provide valid input
      await userEvent.type(screen.getByLabelText(/Title/i), 'Valid title');

      // Error should disappear
      await waitFor(() => {
        expect(screen.queryByText(/Title is required/i)).not.toBeInTheDocument();
      });
    });
  });

  // ============================================
  // Cancel/Close Tests
  // ============================================
  describe('Cancel/Close', () => {
    it('should call onClose when clicking Cancel', async () => {
      const onClose = vi.fn();
      render(<ScopeItemForm {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should reset form when closed and reopened', async () => {
      const { rerender } = render(<ScopeItemForm {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'Some text');

      // Close modal
      rerender(<ScopeItemForm {...defaultProps} isOpen={false} />);

      // Reopen modal
      rerender(<ScopeItemForm {...defaultProps} isOpen={true} />);

      expect(screen.getByLabelText(/Title/i)).toHaveValue('');
    });

    it('should reset form when switching from edit to create', async () => {
      const { rerender } = render(<ScopeItemForm {...defaultProps} item={mockItem} />);

      expect(screen.getByLabelText(/Title/i)).toHaveValue('Design homepage mockups');

      // Switch to create mode (no item)
      rerender(<ScopeItemForm {...defaultProps} item={null} />);

      expect(screen.getByLabelText(/Title/i)).toHaveValue('');
    });
  });

  // ============================================
  // Loading State Tests
  // ============================================
  describe('Loading State', () => {
    it('should show loading state on submit button when isLoading', () => {
      render(<ScopeItemForm {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole('button', { name: /Add Item/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable Cancel button when loading', () => {
      render(<ScopeItemForm {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelButton).toBeDisabled();
    });
  });

  // ============================================
  // Not Open Tests
  // ============================================
  describe('Closed State', () => {
    it('should not render when isOpen is false', () => {
      render(<ScopeItemForm {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Add Scope Item')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Form Fields Tests
  // ============================================
  describe('Form Fields', () => {
    it('should validate title as required on submit', async () => {
      render(<ScopeItemForm {...defaultProps} />);

      // Try to submit without title
      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
      });
    });

    it('should have description as textarea', () => {
      render(<ScopeItemForm {...defaultProps} />);

      const description = screen.getByLabelText(/Description/i);
      expect(description.tagName).toBe('TEXTAREA');
    });

    it('should have hours as number input', () => {
      render(<ScopeItemForm {...defaultProps} />);

      const hours = screen.getByLabelText(/Estimated Hours/i);
      expect(hours).toHaveAttribute('type', 'number');
    });

    it('should allow decimal hours', async () => {
      const onSubmit = vi.fn();
      render(<ScopeItemForm {...defaultProps} onSubmit={onSubmit} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'Test');
      await userEvent.type(screen.getByLabelText(/Estimated Hours/i), '2.5');

      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            estimated_hours: 2.5,
          })
        );
      });
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('Accessibility', () => {
    it('should have proper labels for all fields', () => {
      render(<ScopeItemForm {...defaultProps} />);

      expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Estimated Hours/i)).toBeInTheDocument();
    });

    it('should have Cancel and Submit buttons', () => {
      render(<ScopeItemForm {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();
    });

    it('should associate error messages with fields', async () => {
      render(<ScopeItemForm {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /Add Item/i }));

      await waitFor(() => {
        const errorMessage = screen.getByText(/Title is required/i);
        expect(errorMessage).toHaveAttribute('role', 'alert');
      });
    });
  });
});
