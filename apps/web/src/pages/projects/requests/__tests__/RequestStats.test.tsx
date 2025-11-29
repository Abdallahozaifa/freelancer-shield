import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RequestStats, StatsFilter } from '../RequestStats';

describe('RequestStats', () => {
  const defaultProps = {
    total: 10,
    inScope: 5,
    outOfScope: 3,
    clarificationNeeded: 2,
    isLoading: false,
    activeFilter: 'all' as StatsFilter,
    onFilterChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all stat cards', () => {
      render(<RequestStats {...defaultProps} />);

      expect(screen.getByText('All Active')).toBeInTheDocument();
      expect(screen.getByText('Out of Scope')).toBeInTheDocument();
      expect(screen.getByText('In Scope')).toBeInTheDocument();
      expect(screen.getByText('Needs Clarification')).toBeInTheDocument();
    });

    it('should display correct values', () => {
      render(<RequestStats {...defaultProps} />);

      expect(screen.getByText('10')).toBeInTheDocument(); // total
      expect(screen.getByText('5')).toBeInTheDocument(); // inScope
      expect(screen.getByText('3')).toBeInTheDocument(); // outOfScope
      expect(screen.getByText('2')).toBeInTheDocument(); // clarificationNeeded
    });

    it('should show helper text', () => {
      render(<RequestStats {...defaultProps} />);

      expect(screen.getByText('Click a card to filter requests')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading skeletons when isLoading is true', () => {
      render(<RequestStats {...defaultProps} isLoading={true} />);

      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not show stat values when loading', () => {
      render(<RequestStats {...defaultProps} isLoading={true} />);

      expect(screen.queryByText('10')).not.toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onFilterChange when clicking All Active card', () => {
      const onFilterChange = vi.fn();
      render(<RequestStats {...defaultProps} onFilterChange={onFilterChange} />);

      fireEvent.click(screen.getByText('All Active').closest('button')!);

      expect(onFilterChange).toHaveBeenCalledWith('all');
    });

    it('should call onFilterChange when clicking Out of Scope card', () => {
      const onFilterChange = vi.fn();
      render(<RequestStats {...defaultProps} onFilterChange={onFilterChange} />);

      fireEvent.click(screen.getByText('Out of Scope').closest('button')!);

      expect(onFilterChange).toHaveBeenCalledWith('out_of_scope');
    });

    it('should call onFilterChange when clicking In Scope card', () => {
      const onFilterChange = vi.fn();
      render(<RequestStats {...defaultProps} onFilterChange={onFilterChange} />);

      fireEvent.click(screen.getByText('In Scope').closest('button')!);

      expect(onFilterChange).toHaveBeenCalledWith('in_scope');
    });

    it('should call onFilterChange when clicking Needs Clarification card', () => {
      const onFilterChange = vi.fn();
      render(<RequestStats {...defaultProps} onFilterChange={onFilterChange} />);

      fireEvent.click(screen.getByText('Needs Clarification').closest('button')!);

      expect(onFilterChange).toHaveBeenCalledWith('clarification_needed');
    });
  });

  describe('active state', () => {
    it('should highlight the active filter card', () => {
      const { container } = render(
        <RequestStats {...defaultProps} activeFilter="out_of_scope" />
      );

      // The out_of_scope card should have the active ring class
      const outOfScopeCard = screen.getByText('Out of Scope').closest('button');
      expect(outOfScopeCard).toHaveClass('border-indigo-500');
    });

    it('should not highlight non-active cards', () => {
      render(<RequestStats {...defaultProps} activeFilter="all" />);

      const outOfScopeCard = screen.getByText('Out of Scope').closest('button');
      expect(outOfScopeCard).not.toHaveClass('border-indigo-500');
    });
  });

  describe('warning styling', () => {
    it('should show warning styling for out of scope when count > 0', () => {
      render(<RequestStats {...defaultProps} outOfScope={5} />);

      const outOfScopeCard = screen.getByText('Out of Scope').closest('button');
      expect(outOfScopeCard).toHaveClass('border-red-300');
    });

    it('should not show warning styling when out of scope is 0', () => {
      render(<RequestStats {...defaultProps} outOfScope={0} />);

      const outOfScopeCard = screen.getByText('Out of Scope').closest('button');
      expect(outOfScopeCard).not.toHaveClass('border-red-300');
    });
  });

  describe('zero values', () => {
    it('should display zero values correctly', () => {
      render(
        <RequestStats
          {...defaultProps}
          total={0}
          inScope={0}
          outOfScope={0}
          clarificationNeeded={0}
        />
      );

      const zeros = screen.getAllByText('0');
      expect(zeros).toHaveLength(4);
    });
  });
});
