import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ScopeDragDrop } from '../ScopeDragDrop';
import type { ScopeItem } from '../../../../types';

const mockItems: ScopeItem[] = [
  {
    id: 'scope-1',
    project_id: 'project-1',
    title: 'First item',
    description: 'Description 1',
    order: 0,
    is_completed: false,
    estimated_hours: 8,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'scope-2',
    project_id: 'project-1',
    title: 'Second item',
    description: 'Description 2',
    order: 1,
    is_completed: true,
    estimated_hours: 6,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'scope-3',
    project_id: 'project-1',
    title: 'Third item',
    description: 'Description 3',
    order: 2,
    is_completed: false,
    estimated_hours: 4,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Helper to create mock dataTransfer
const createMockDataTransfer = () => ({
  setData: vi.fn(),
  getData: vi.fn(),
  effectAllowed: 'move',
  dropEffect: 'move',
});

describe('ScopeDragDrop', () => {
  const defaultProps = {
    items: mockItems,
    onReorder: vi.fn(),
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
    it('should render all items', () => {
      render(<ScopeDragDrop {...defaultProps} />);

      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByText('Second item')).toBeInTheDocument();
      expect(screen.getByText('Third item')).toBeInTheDocument();
    });

    it('should render items in correct order', () => {
      render(<ScopeDragDrop {...defaultProps} />);

      const items = screen.getAllByText(/item$/);
      expect(items[0]).toHaveTextContent('First item');
      expect(items[1]).toHaveTextContent('Second item');
      expect(items[2]).toHaveTextContent('Third item');
    });

    it('should render empty when no items', () => {
      render(<ScopeDragDrop {...defaultProps} items={[]} />);

      expect(screen.queryByText('First item')).not.toBeInTheDocument();
    });

    it('should render single item', () => {
      render(<ScopeDragDrop {...defaultProps} items={[mockItems[0]]} />);

      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.queryByText('Second item')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Draggable Attribute Tests
  // ============================================
  describe('Draggable Attributes', () => {
    it('should have draggable attribute on items', () => {
      render(<ScopeDragDrop {...defaultProps} />);

      const firstItemContainer = screen.getByText('First item').closest('[draggable]');
      expect(firstItemContainer).toHaveAttribute('draggable', 'true');
    });

    it('should all items be draggable', () => {
      render(<ScopeDragDrop {...defaultProps} />);

      const draggableItems = document.querySelectorAll('[draggable="true"]');
      expect(draggableItems).toHaveLength(3);
    });
  });

  // ============================================
  // Drag Events Tests
  // ============================================
  describe('Drag Events', () => {
    it('should handle drag start', () => {
      render(<ScopeDragDrop {...defaultProps} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Component should track dragged item internally
    });

    it('should handle drag end', () => {
      render(<ScopeDragDrop {...defaultProps} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      fireEvent.dragEnd(firstItem!);

      // Dragging state should be cleared
    });

    it('should handle drag over', () => {
      render(<ScopeDragDrop {...defaultProps} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      const secondItem = screen.getByText('Second item').closest('[draggable]');
      
      // Start dragging first item
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Drag over second item
      fireEvent.dragOver(secondItem!, {
        dataTransfer: createMockDataTransfer(),
      });
    });

    it('should handle drop and call onReorder', () => {
      const onReorder = vi.fn();
      render(<ScopeDragDrop {...defaultProps} onReorder={onReorder} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      const secondItem = screen.getByText('Second item').closest('[draggable]');
      
      // Start dragging first item
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Drop on second item
      fireEvent.drop(secondItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // onReorder should be called with new order
      expect(onReorder).toHaveBeenCalled();
    });

    it('should not reorder when dropping on same item', () => {
      const onReorder = vi.fn();
      render(<ScopeDragDrop {...defaultProps} onReorder={onReorder} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      
      // Start dragging first item
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Drop on same item
      fireEvent.drop(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // onReorder should not be called
      expect(onReorder).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Callback Tests
  // ============================================
  describe('Callbacks', () => {
    it('should pass onToggleComplete to ScopeItemCard', async () => {
      const onToggleComplete = vi.fn();
      render(<ScopeDragDrop {...defaultProps} onToggleComplete={onToggleComplete} />);

      // Click checkbox on first item
      const checkboxes = screen.getAllByLabelText(/Mark as complete/i);
      fireEvent.click(checkboxes[0]);

      expect(onToggleComplete).toHaveBeenCalledWith(mockItems[0]);
    });

    it('should pass onEdit to ScopeItemCard', () => {
      const onEdit = vi.fn();
      render(<ScopeDragDrop {...defaultProps} onEdit={onEdit} />);

      // Click edit button on first item
      const editButtons = screen.getAllByLabelText(/Edit scope item/i);
      fireEvent.click(editButtons[0]);

      expect(onEdit).toHaveBeenCalledWith(mockItems[0]);
    });

    it('should pass onDelete to ScopeItemCard', () => {
      const onDelete = vi.fn();
      render(<ScopeDragDrop {...defaultProps} onDelete={onDelete} />);

      // Click delete button on first item
      const deleteButtons = screen.getAllByLabelText(/Delete scope item/i);
      fireEvent.click(deleteButtons[0]);

      expect(onDelete).toHaveBeenCalledWith(mockItems[0]);
    });
  });

  // ============================================
  // Reorder Logic Tests
  // ============================================
  describe('Reorder Logic', () => {
    it('should reorder items correctly when moving first to second position', () => {
      const onReorder = vi.fn();
      render(<ScopeDragDrop {...defaultProps} onReorder={onReorder} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      const secondItem = screen.getByText('Second item').closest('[draggable]');
      
      // Drag first item to second position
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      fireEvent.drop(secondItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Should be called with reordered IDs
      expect(onReorder).toHaveBeenCalledWith(['scope-2', 'scope-1', 'scope-3']);
    });

    it('should reorder items correctly when moving last to first', () => {
      const onReorder = vi.fn();
      render(<ScopeDragDrop {...defaultProps} onReorder={onReorder} />);

      const thirdItem = screen.getByText('Third item').closest('[draggable]');
      const firstItem = screen.getByText('First item').closest('[draggable]');
      
      // Drag third item to first position
      fireEvent.dragStart(thirdItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      fireEvent.drop(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      expect(onReorder).toHaveBeenCalledWith(['scope-3', 'scope-1', 'scope-2']);
    });
  });

  // ============================================
  // Visual Feedback Tests
  // ============================================
  describe('Visual Feedback', () => {
    it('should show drop indicator on drag over different item', () => {
      render(<ScopeDragDrop {...defaultProps} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      const secondItem = screen.getByText('Second item').closest('[draggable]');
      
      // Start dragging first item
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Drag over second item
      fireEvent.dragOver(secondItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // The draggable div itself gets the border class
      expect(secondItem).toHaveClass('border-t-2');
    });

    it('should remove drop indicator on drag leave', () => {
      render(<ScopeDragDrop {...defaultProps} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      const secondItem = screen.getByText('Second item').closest('[draggable]');
      
      // Start dragging
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Drag over
      fireEvent.dragOver(secondItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Drag leave
      fireEvent.dragLeave(secondItem!);

      // Border indicator should be removed
      expect(secondItem).not.toHaveClass('border-t-2');
    });

    it('should not show indicator when dragging over same item', () => {
      render(<ScopeDragDrop {...defaultProps} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      
      // Start dragging first item
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Drag over same item
      fireEvent.dragOver(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Should not have border indicator
      expect(firstItem).not.toHaveClass('border-t-2');
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================
  describe('Edge Cases', () => {
    it('should handle items with same order gracefully', () => {
      const sameOrderItems = mockItems.map((item) => ({ ...item, order: 0 }));
      
      render(<ScopeDragDrop {...defaultProps} items={sameOrderItems} />);

      // Should still render all items
      expect(screen.getByText('First item')).toBeInTheDocument();
      expect(screen.getByText('Second item')).toBeInTheDocument();
      expect(screen.getByText('Third item')).toBeInTheDocument();
    });

    it('should handle drag end without drop', () => {
      const onReorder = vi.fn();
      render(<ScopeDragDrop {...defaultProps} onReorder={onReorder} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      
      // Start and end drag without dropping
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });
      
      fireEvent.dragEnd(firstItem!);

      // onReorder should not be called
      expect(onReorder).not.toHaveBeenCalled();
    });

    it('should clear drag state after drop', () => {
      const onReorder = vi.fn();
      render(<ScopeDragDrop {...defaultProps} onReorder={onReorder} />);

      const firstItem = screen.getByText('First item').closest('[draggable]');
      const secondItem = screen.getByText('Second item').closest('[draggable]');
      
      // Complete a drag and drop
      fireEvent.dragStart(firstItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      fireEvent.drop(secondItem!, {
        dataTransfer: createMockDataTransfer(),
      });

      // Verify no visual indicators remain
      expect(firstItem).not.toHaveClass('border-t-2');
      expect(secondItem).not.toHaveClass('border-t-2');
    });
  });
});
