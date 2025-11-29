import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../../utils/format', () => ({
  formatCurrency: (amount: number) => `$${amount.toFixed(2)}`,
}));

import { ProposalStats } from '../ProposalStats';

const mockOnFilterChange = vi.fn();

const defaultProps = {
  draft: 3,
  sent: 2,
  pendingAmount: 5000,
  isLoading: false,
  activeFilter: 'all' as const,
  onFilterChange: mockOnFilterChange,
};

describe('ProposalStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading skeletons when loading', () => {
      render(<ProposalStats {...defaultProps} isLoading={true} />);

      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBe(3);
    });

    it('should not show stats when loading', () => {
      render(<ProposalStats {...defaultProps} isLoading={true} />);

      expect(screen.queryByText('All Active')).not.toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('should render All Active card', () => {
      render(<ProposalStats {...defaultProps} />);

      expect(screen.getByText('All Active')).toBeInTheDocument();
    });

    it('should render Draft card', () => {
      render(<ProposalStats {...defaultProps} />);

      expect(screen.getByText('Draft')).toBeInTheDocument();
    });

    it('should render Sent card', () => {
      render(<ProposalStats {...defaultProps} />);

      expect(screen.getByText('Sent')).toBeInTheDocument();
    });

    it('should show correct total for All Active (draft + sent)', () => {
      render(<ProposalStats {...defaultProps} />);

      // Total = 3 + 2 = 5
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should show correct draft count', () => {
      render(<ProposalStats {...defaultProps} />);

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should show correct sent count', () => {
      render(<ProposalStats {...defaultProps} />);

      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should show pending amount for sent proposals', () => {
      render(<ProposalStats {...defaultProps} />);

      // Check for pending amount - might be formatted with comma or without
      expect(screen.getByText(/\$5[,]?000.*pending/i)).toBeInTheDocument();
    });

    it('should not show pending amount when zero', () => {
      render(<ProposalStats {...defaultProps} pendingAmount={0} />);

      expect(screen.queryByText(/pending/)).not.toBeInTheDocument();
    });

    it('should show helper text', () => {
      render(<ProposalStats {...defaultProps} />);

      expect(screen.getByText('Click a card to filter')).toBeInTheDocument();
    });
  });

  describe('Filter Interactions', () => {
    it('should call onFilterChange with "all" when All Active is clicked', async () => {
      render(<ProposalStats {...defaultProps} activeFilter="draft" />);

      const allActiveButton = screen.getByText('All Active').closest('button');
      await userEvent.click(allActiveButton!);

      expect(mockOnFilterChange).toHaveBeenCalledWith('all');
    });

    it('should call onFilterChange with "draft" when Draft is clicked', async () => {
      render(<ProposalStats {...defaultProps} />);

      const draftButton = screen.getByText('Draft').closest('button');
      await userEvent.click(draftButton!);

      expect(mockOnFilterChange).toHaveBeenCalledWith('draft');
    });

    it('should call onFilterChange with "sent" when Sent is clicked', async () => {
      render(<ProposalStats {...defaultProps} />);

      const sentButton = screen.getByText('Sent').closest('button');
      await userEvent.click(sentButton!);

      expect(mockOnFilterChange).toHaveBeenCalledWith('sent');
    });
  });

  describe('Active Filter Styling', () => {
    it('should highlight All Active when active', () => {
      render(<ProposalStats {...defaultProps} activeFilter="all" />);

      const allActiveButton = screen.getByText('All Active').closest('button');
      expect(allActiveButton).toHaveClass('border-indigo-500');
    });

    it('should highlight Draft when active', () => {
      render(<ProposalStats {...defaultProps} activeFilter="draft" />);

      const draftButton = screen.getByText('Draft').closest('button');
      expect(draftButton).toHaveClass('border-indigo-500');
    });

    it('should highlight Sent when active', () => {
      render(<ProposalStats {...defaultProps} activeFilter="sent" />);

      const sentButton = screen.getByText('Sent').closest('button');
      expect(sentButton).toHaveClass('border-indigo-500');
    });

    it('should not highlight inactive cards', () => {
      render(<ProposalStats {...defaultProps} activeFilter="draft" />);

      const allActiveButton = screen.getByText('All Active').closest('button');
      expect(allActiveButton).not.toHaveClass('border-indigo-500');
    });
  });

  describe('Sent Card Highlighting', () => {
    it('should have special styling when there are sent proposals', () => {
      render(<ProposalStats {...defaultProps} sent={5} activeFilter="all" />);

      const sentButton = screen.getByText('Sent').closest('button');
      expect(sentButton).toHaveClass('border-blue-300');
    });

    it('should show sent count in blue when highlighted', () => {
      render(<ProposalStats {...defaultProps} sent={5} activeFilter="all" />);

      const sentValue = screen.getByText('5');
      // The sent value should be styled differently
      expect(sentValue).toHaveClass('text-blue-600');
    });

    it('should not have special styling when no sent proposals', () => {
      render(<ProposalStats {...defaultProps} sent={0} activeFilter="all" />);

      const sentButton = screen.getByText('Sent').closest('button');
      expect(sentButton).not.toHaveClass('border-blue-300');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values', () => {
      render(
        <ProposalStats 
          {...defaultProps} 
          draft={0} 
          sent={0} 
          pendingAmount={0}
        />
      );

      // Should show 0 for all counts
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBe(3);
    });

    it('should handle large numbers', () => {
      render(
        <ProposalStats 
          {...defaultProps} 
          draft={999} 
          sent={888} 
          pendingAmount={100000}
        />
      );

      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('888')).toBeInTheDocument();
      // Pending amount might be formatted as $100,000.00 or $100000.00
      expect(screen.getByText(/\$100[,]?000.*pending/i)).toBeInTheDocument();
    });
  });
});
