import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RequestClassificationBadge } from '../RequestClassificationBadge';

describe('RequestClassificationBadge', () => {
  describe('out_of_scope', () => {
    it('should render Out of Scope text', () => {
      render(<RequestClassificationBadge classification="out_of_scope" />);
      expect(screen.getByText('Out of Scope')).toBeInTheDocument();
    });

    it('should have red styling', () => {
      const { container } = render(<RequestClassificationBadge classification="out_of_scope" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-red-100');
      expect(badge).toHaveClass('text-red-800');
    });
  });

  describe('in_scope', () => {
    it('should render In Scope text', () => {
      render(<RequestClassificationBadge classification="in_scope" />);
      expect(screen.getByText('In Scope')).toBeInTheDocument();
    });

    it('should have green styling', () => {
      const { container } = render(<RequestClassificationBadge classification="in_scope" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('text-green-800');
    });
  });

  describe('clarification_needed', () => {
    it('should render Needs Clarification text', () => {
      render(<RequestClassificationBadge classification="clarification_needed" />);
      expect(screen.getByText('Needs Clarification')).toBeInTheDocument();
    });

    it('should have yellow styling', () => {
      const { container } = render(<RequestClassificationBadge classification="clarification_needed" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-yellow-100');
      expect(badge).toHaveClass('text-yellow-800');
    });
  });

  describe('pending', () => {
    it('should render Pending text', () => {
      render(<RequestClassificationBadge classification="pending" />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should have gray styling', () => {
      const { container } = render(<RequestClassificationBadge classification="pending" />);
      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-gray-100');
      expect(badge).toHaveClass('text-gray-700');
    });
  });
});
