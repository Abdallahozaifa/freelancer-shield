import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { DeleteScopeItemModal } from '../DeleteScopeItemModal';
import type { ScopeItem } from '../../../../types';

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

describe('DeleteScopeItemModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onConfirm: vi.fn(),
    item: mockItem,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Rendering Tests
  // ============================================
  describe('Rendering', () => {
    it('should render modal title', () => {
      render(<DeleteScopeItemModal {...defaultProps} />);
      expect(screen.getByText('Delete Scope Item')).toBeInTheDocument();
    });

    it('should render confirmation message with item title', () => {
      render(<DeleteScopeItemModal {...defaultProps} />);
      expect(screen.getByText(/Are you sure you want to delete/)).toBeInTheDocument();
      expect(screen.getByText(/"Design homepage mockups"/)).toBeInTheDocument();
    });

    it('should render warning about irreversible action', () => {
      render(<DeleteScopeItemModal {...defaultProps} />);
      expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    });

    it('should render warning icon', () => {
      render(<DeleteScopeItemModal {...defaultProps} />);
      // Check for the warning icon container
      const iconContainer = document.querySelector('.bg-red-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render Cancel button', () => {
      render(<DeleteScopeItemModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    });

    it('should render Delete button', () => {
      render(<DeleteScopeItemModal {...defaultProps} />);
      expect(screen.getByRole('button', { name: /^Delete$/i })).toBeInTheDocument();
    });
  });

  // ============================================
  // Interaction Tests
  // ============================================
  describe('Interactions', () => {
    it('should call onConfirm when clicking Delete', async () => {
      const onConfirm = vi.fn();
      render(<DeleteScopeItemModal {...defaultProps} onConfirm={onConfirm} />);

      await userEvent.click(screen.getByRole('button', { name: /^Delete$/i }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking Cancel', async () => {
      const onClose = vi.fn();
      render(<DeleteScopeItemModal {...defaultProps} onClose={onClose} />);

      await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onConfirm when clicking Cancel', async () => {
      const onConfirm = vi.fn();
      render(<DeleteScopeItemModal {...defaultProps} onConfirm={onConfirm} />);

      await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Loading State Tests
  // ============================================
  describe('Loading State', () => {
    it('should disable Delete button when loading', () => {
      render(<DeleteScopeItemModal {...defaultProps} isLoading={true} />);

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      expect(deleteButton).toBeDisabled();
    });

    it('should disable Cancel button when loading', () => {
      render(<DeleteScopeItemModal {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      expect(cancelButton).toBeDisabled();
    });

    it('should show loading indicator on Delete button', () => {
      render(<DeleteScopeItemModal {...defaultProps} isLoading={true} />);

      // The button should have loading state (spinner)
      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      expect(deleteButton.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  // ============================================
  // Closed State Tests
  // ============================================
  describe('Closed State', () => {
    it('should not render when isOpen is false', () => {
      render(<DeleteScopeItemModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Delete Scope Item')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Null Item Tests
  // ============================================
  describe('Null Item', () => {
    it('should not render when item is null', () => {
      render(<DeleteScopeItemModal {...defaultProps} item={null} />);

      expect(screen.queryByText('Delete Scope Item')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Different Item Titles Tests
  // ============================================
  describe('Different Item Titles', () => {
    it('should display correct title for different items', () => {
      const differentItem: ScopeItem = {
        ...mockItem,
        title: 'Build responsive header',
      };

      render(<DeleteScopeItemModal {...defaultProps} item={differentItem} />);

      expect(screen.getByText(/"Build responsive header"/)).toBeInTheDocument();
    });

    it('should handle long titles', () => {
      const longTitleItem: ScopeItem = {
        ...mockItem,
        title: 'This is a very long title that should still be displayed correctly in the modal',
      };

      render(<DeleteScopeItemModal {...defaultProps} item={longTitleItem} />);

      expect(
        screen.getByText(
          /"This is a very long title that should still be displayed correctly in the modal"/
        )
      ).toBeInTheDocument();
    });

    it('should handle special characters in title', () => {
      const specialCharItem: ScopeItem = {
        ...mockItem,
        title: 'Design "mockups" & layouts',
      };

      render(<DeleteScopeItemModal {...defaultProps} item={specialCharItem} />);

      expect(screen.getByText(/"Design "mockups" & layouts"/)).toBeInTheDocument();
    });
  });

  // ============================================
  // Styling Tests
  // ============================================
  describe('Styling', () => {
    it('should have danger variant on Delete button', () => {
      render(<DeleteScopeItemModal {...defaultProps} />);

      const deleteButton = screen.getByRole('button', { name: /^Delete$/i });
      // Check for danger button styling (red background)
      expect(deleteButton).toHaveClass('bg-red-600');
    });

    it('should have outline variant on Cancel button', () => {
      render(<DeleteScopeItemModal {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      // Check for outline button styling
      expect(cancelButton).toHaveClass('border');
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<DeleteScopeItemModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Delete$/i })).toBeInTheDocument();
    });

    it('should be a dialog', () => {
      render(<DeleteScopeItemModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
