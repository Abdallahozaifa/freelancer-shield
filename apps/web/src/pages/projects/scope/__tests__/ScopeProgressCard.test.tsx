import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ScopeProgressCard, ScopeProgressData } from '../ScopeProgressCard';

describe('ScopeProgressCard', () => {
  const defaultProgress: ScopeProgressData = {
    total_items: 10,
    completed_items: 6,
    completion_percentage: 60,
    total_estimated_hours: 50,
    completed_estimated_hours: 30,
  };

  // ============================================
  // Basic Rendering Tests
  // ============================================
  describe('Basic Rendering', () => {
    it('should render progress text', () => {
      render(<ScopeProgressCard progress={defaultProgress} />);
      expect(screen.getByText(/Progress: 6 of 10 items \(60%\)/)).toBeInTheDocument();
    });

    it('should render completed count', () => {
      render(<ScopeProgressCard progress={defaultProgress} />);
      expect(screen.getByText('6 Completed')).toBeInTheDocument();
    });

    it('should render remaining count', () => {
      render(<ScopeProgressCard progress={defaultProgress} />);
      expect(screen.getByText('4 Remaining')).toBeInTheDocument();
    });

    it('should render hours completed', () => {
      render(<ScopeProgressCard progress={defaultProgress} />);
      expect(screen.getByText('30 of 50h completed')).toBeInTheDocument();
    });
  });

  // ============================================
  // Progress Bar Tests
  // ============================================
  describe('Progress Bar', () => {
    it('should render progress bar with correct width', () => {
      render(<ScopeProgressCard progress={defaultProgress} />);
      
      const progressBar = document.querySelector('[style*="width: 60%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show 0% width for empty progress', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            completion_percentage: 0,
          }}
        />
      );
      
      const progressBar = document.querySelector('[style*="width: 0%"]');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show 100% width for complete progress', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            completion_percentage: 100,
          }}
        />
      );
      
      const progressBar = document.querySelector('[style*="width: 100%"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // ============================================
  // Color Variations Tests
  // ============================================
  describe('Progress Bar Colors', () => {
    it('should show gray color for 0-24%', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            completion_percentage: 20,
          }}
        />
      );
      
      const progressBar = document.querySelector('.bg-gray-400');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show yellow color for 25-49%', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            completion_percentage: 30,
          }}
        />
      );
      
      const progressBar = document.querySelector('.bg-yellow-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show blue color for 50-74%', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            completion_percentage: 60,
          }}
        />
      );
      
      const progressBar = document.querySelector('.bg-blue-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('should show green color for 75-100%', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            completion_percentage: 80,
          }}
        />
      );
      
      const progressBar = document.querySelector('.bg-green-500');
      expect(progressBar).toBeInTheDocument();
    });
  });

  // ============================================
  // Edge Cases Tests
  // ============================================
  describe('Edge Cases', () => {
    it('should handle zero items', () => {
      render(
        <ScopeProgressCard
          progress={{
            total_items: 0,
            completed_items: 0,
            completion_percentage: 0,
            total_estimated_hours: null,
            completed_estimated_hours: null,
          }}
        />
      );
      
      expect(screen.getByText(/Progress: 0 of 0 items \(0%\)/)).toBeInTheDocument();
      expect(screen.getByText('0 Completed')).toBeInTheDocument();
      expect(screen.getByText('0 Remaining')).toBeInTheDocument();
    });

    it('should not show hours when total is null', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            total_estimated_hours: null,
            completed_estimated_hours: null,
          }}
        />
      );
      
      expect(screen.queryByText(/completed$/)).not.toBeInTheDocument();
    });

    it('should not show hours when total is 0', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            total_estimated_hours: 0,
            completed_estimated_hours: 0,
          }}
        />
      );
      
      expect(screen.queryByText(/of 0h completed/)).not.toBeInTheDocument();
    });

    it('should handle all items completed', () => {
      render(
        <ScopeProgressCard
          progress={{
            total_items: 5,
            completed_items: 5,
            completion_percentage: 100,
            total_estimated_hours: 20,
            completed_estimated_hours: 20,
          }}
        />
      );
      
      expect(screen.getByText(/Progress: 5 of 5 items \(100%\)/)).toBeInTheDocument();
      expect(screen.getByText('5 Completed')).toBeInTheDocument();
      expect(screen.getByText('0 Remaining')).toBeInTheDocument();
    });

    it('should handle single item', () => {
      render(
        <ScopeProgressCard
          progress={{
            total_items: 1,
            completed_items: 0,
            completion_percentage: 0,
            total_estimated_hours: 5,
            completed_estimated_hours: 0,
          }}
        />
      );
      
      expect(screen.getByText(/Progress: 0 of 1 items \(0%\)/)).toBeInTheDocument();
    });
  });

  // ============================================
  // Hours Formatting Tests
  // ============================================
  describe('Hours Formatting', () => {
    it('should format whole hours without decimals', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            total_estimated_hours: 10,
            completed_estimated_hours: 5,
          }}
        />
      );
      
      expect(screen.getByText('5 of 10h completed')).toBeInTheDocument();
    });

    it('should format decimal hours correctly', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            total_estimated_hours: 10.5,
            completed_estimated_hours: 5.5,
          }}
        />
      );
      
      expect(screen.getByText('5.5 of 10.5h completed')).toBeInTheDocument();
    });

    it('should handle string hours from API', () => {
      render(
        <ScopeProgressCard
          progress={{
            ...defaultProgress,
            total_estimated_hours: '10' as unknown as number,
            completed_estimated_hours: '5' as unknown as number,
          }}
        />
      );
      
      expect(screen.getByText('5 of 10h completed')).toBeInTheDocument();
    });
  });

  // ============================================
  // Custom Class Tests
  // ============================================
  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ScopeProgressCard progress={defaultProgress} className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // ============================================
  // Icon Tests
  // ============================================
  describe('Icons', () => {
    it('should render check circle icon for completed', () => {
      render(<ScopeProgressCard progress={defaultProgress} />);
      
      // Check for the completed section with icon
      const completedSection = screen.getByText('6 Completed').closest('div');
      expect(completedSection?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render clock icon for remaining', () => {
      render(<ScopeProgressCard progress={defaultProgress} />);
      
      // Check for the remaining section with icon
      const remainingSection = screen.getByText('4 Remaining').closest('div');
      expect(remainingSection?.querySelector('svg')).toBeInTheDocument();
    });
  });
});
