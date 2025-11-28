import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ScopeItemCard } from '../ScopeItemCard';
import type { ScopeItem } from '../../../../types';

// Mock data
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

const mockCompletedItem: ScopeItem = {
  ...mockItem,
  id: 'scope-2',
  title: 'Build responsive header',
  is_completed: true,
  estimated_hours: 6,
};

const mockItemWithoutHours: ScopeItem = {
  ...mockItem,
  id: 'scope-3',
  title: 'Review designs',
  estimated_hours: null,
};

const mockItemWithoutDescription: ScopeItem = {
  ...mockItem,
  id: 'scope-4',
  title: 'Quick task',
  description: null,
};

describe('ScopeItemCard', () => {
  const defaultProps = {
    item: mockItem,
    onToggleComplete: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Rendering Tests
  // ============================================
  describe('Rendering', () => {
    it('should render item title', () => {
      render(<ScopeItemCard {...defaultProps} />);
      expect(screen.getByText('Design homepage mockups')).toBeInTheDocument();
    });

    it('should render item description', () => {
      render(<ScopeItemCard {...defaultProps} />);
      expect(
        screen.getByText('Create 3 design options for client review')
      ).toBeInTheDocument();
    });

    it('should render estimated hours', () => {
      render(<ScopeItemCard {...defaultProps} />);
      expect(screen.getByText('Est: 8h')).toBeInTheDocument();
    });

    it('should not render description when null', () => {
      render(<ScopeItemCard {...defaultProps} item={mockItemWithoutDescription} />);
      expect(screen.getByText('Quick task')).toBeInTheDocument();
      expect(
        screen.queryByText('Create 3 design options for client review')
      ).not.toBeInTheDocument();
    });

    it('should not render hours when null', () => {
      render(<ScopeItemCard {...defaultProps} item={mockItemWithoutHours} />);
      expect(screen.queryByText(/Est:/)).not.toBeInTheDocument();
    });

    it('should render drag handle', () => {
      render(<ScopeItemCard {...defaultProps} />);
      // The drag handle has specific cursor classes
      const dragHandle = document.querySelector('.cursor-grab');
      expect(dragHandle).toBeInTheDocument();
    });

    it('should render edit button', () => {
      render(<ScopeItemCard {...defaultProps} />);
      expect(screen.getByLabelText('Edit scope item')).toBeInTheDocument();
    });

    it('should render delete button', () => {
      render(<ScopeItemCard {...defaultProps} />);
      expect(screen.getByLabelText('Delete scope item')).toBeInTheDocument();
    });
  });

  // ============================================
  // Incomplete Item Tests
  // ============================================
  describe('Incomplete Item', () => {
    it('should render unchecked checkbox for incomplete item', () => {
      render(<ScopeItemCard {...defaultProps} />);
      const checkbox = screen.getByLabelText('Mark as complete');
      expect(checkbox).toBeInTheDocument();
    });

    it('should not have strikethrough on title', () => {
      render(<ScopeItemCard {...defaultProps} />);
      const title = screen.getByText('Design homepage mockups');
      expect(title).not.toHaveClass('line-through');
    });

    it('should not have muted styling', () => {
      render(<ScopeItemCard {...defaultProps} />);
      const title = screen.getByText('Design homepage mockups');
      expect(title).toHaveClass('text-gray-900');
    });
  });

  // ============================================
  // Completed Item Tests
  // ============================================
  describe('Completed Item', () => {
    it('should render checked checkbox for completed item', () => {
      render(<ScopeItemCard {...defaultProps} item={mockCompletedItem} />);
      const checkbox = screen.getByLabelText('Mark as incomplete');
      expect(checkbox).toBeInTheDocument();
    });

    it('should have strikethrough on title', () => {
      render(<ScopeItemCard {...defaultProps} item={mockCompletedItem} />);
      const title = screen.getByText('Build responsive header');
      expect(title).toHaveClass('line-through');
    });

    it('should have muted styling on title', () => {
      render(<ScopeItemCard {...defaultProps} item={mockCompletedItem} />);
      const title = screen.getByText('Build responsive header');
      expect(title).toHaveClass('text-gray-500');
    });

    it('should show green checkbox background', () => {
      render(<ScopeItemCard {...defaultProps} item={mockCompletedItem} />);
      const checkbox = screen.getByLabelText('Mark as incomplete');
      expect(checkbox).toHaveClass('bg-green-500');
    });
  });

  // ============================================
  // Interaction Tests
  // ============================================
  describe('Interactions', () => {
    it('should call onToggleComplete when clicking checkbox', async () => {
      const onToggleComplete = vi.fn();
      render(<ScopeItemCard {...defaultProps} onToggleComplete={onToggleComplete} />);

      await userEvent.click(screen.getByLabelText('Mark as complete'));

      expect(onToggleComplete).toHaveBeenCalledTimes(1);
      expect(onToggleComplete).toHaveBeenCalledWith(mockItem);
    });

    it('should call onEdit when clicking edit button', async () => {
      const onEdit = vi.fn();
      render(<ScopeItemCard {...defaultProps} onEdit={onEdit} />);

      await userEvent.click(screen.getByLabelText('Edit scope item'));

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockItem);
    });

    it('should call onDelete when clicking delete button', async () => {
      const onDelete = vi.fn();
      render(<ScopeItemCard {...defaultProps} onDelete={onDelete} />);

      await userEvent.click(screen.getByLabelText('Delete scope item'));

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(mockItem);
    });
  });

  // ============================================
  // Dragging State Tests
  // ============================================
  describe('Dragging State', () => {
    it('should apply dragging styles when isDragging is true', () => {
      render(<ScopeItemCard {...defaultProps} isDragging={true} />);

      const card = screen.getByText('Design homepage mockups').closest('div');
      // Find the parent container with the dragging class
      const container = document.querySelector('.shadow-lg');
      expect(container).toBeInTheDocument();
    });

    it('should not have dragging styles by default', () => {
      render(<ScopeItemCard {...defaultProps} />);

      const container = document.querySelector('.shadow-lg');
      expect(container).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Hours Formatting Tests
  // ============================================
  describe('Hours Formatting', () => {
    it('should format whole hours without decimals', () => {
      render(<ScopeItemCard {...defaultProps} item={{ ...mockItem, estimated_hours: 8 }} />);
      expect(screen.getByText('Est: 8h')).toBeInTheDocument();
    });

    it('should format decimal hours with one decimal place', () => {
      render(
        <ScopeItemCard {...defaultProps} item={{ ...mockItem, estimated_hours: 8.5 }} />
      );
      expect(screen.getByText('Est: 8.5h')).toBeInTheDocument();
    });

    it('should handle zero hours', () => {
      render(<ScopeItemCard {...defaultProps} item={{ ...mockItem, estimated_hours: 0 }} />);
      expect(screen.getByText('Est: 0h')).toBeInTheDocument();
    });
  });

  // ============================================
  // Accessibility Tests
  // ============================================
  describe('Accessibility', () => {
    it('should have accessible checkbox label for incomplete items', () => {
      render(<ScopeItemCard {...defaultProps} />);
      expect(screen.getByLabelText('Mark as complete')).toBeInTheDocument();
    });

    it('should have accessible checkbox label for completed items', () => {
      render(<ScopeItemCard {...defaultProps} item={mockCompletedItem} />);
      expect(screen.getByLabelText('Mark as incomplete')).toBeInTheDocument();
    });

    it('should have accessible edit button', () => {
      render(<ScopeItemCard {...defaultProps} />);
      expect(screen.getByLabelText('Edit scope item')).toBeInTheDocument();
    });

    it('should have accessible delete button', () => {
      render(<ScopeItemCard {...defaultProps} />);
      expect(screen.getByLabelText('Delete scope item')).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const onToggleComplete = vi.fn();
      render(<ScopeItemCard {...defaultProps} onToggleComplete={onToggleComplete} />);

      const checkbox = screen.getByLabelText('Mark as complete');
      checkbox.focus();
      await userEvent.keyboard('{Enter}');

      expect(onToggleComplete).toHaveBeenCalled();
    });
  });
});
