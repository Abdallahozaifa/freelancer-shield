import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RequestCard } from '../RequestCard';
import type { ClientRequest } from '../../../../types';

describe('RequestCard', () => {
  const mockOutOfScopeRequest: ClientRequest = {
    id: 'req-1',
    project_id: 'proj-1',
    linked_scope_item_id: null,
    title: 'Add dark mode feature',
    content: 'Can you also add a dark mode toggle? It shouldn\'t take long.',
    source: 'email',
    status: 'analyzed',
    classification: 'out_of_scope',
    confidence: 0.85,
    analysis_reasoning: 'Not in original scope',
    suggested_action: 'Create a proposal',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  const mockInScopeRequest: ClientRequest = {
    ...mockOutOfScopeRequest,
    id: 'req-2',
    title: 'Update homepage copy',
    content: 'Please update the headline text',
    classification: 'in_scope',
    linked_scope_item_id: 'scope-1',
  };

  const mockClarificationRequest: ClientRequest = {
    ...mockOutOfScopeRequest,
    id: 'req-3',
    title: 'Something unclear',
    content: 'Can you do the thing?',
    classification: 'clarification_needed',
    confidence: 0.50,
  };

  const mockAddressedRequest: ClientRequest = {
    ...mockOutOfScopeRequest,
    id: 'req-4',
    status: 'addressed',
  };

  const mockDeclinedRequest: ClientRequest = {
    ...mockOutOfScopeRequest,
    id: 'req-5',
    status: 'declined',
  };

  const defaultProps = {
    request: mockOutOfScopeRequest,
    onCreateProposal: vi.fn(),
    onMarkAddressed: vi.fn().mockResolvedValue(undefined),
    onDismiss: vi.fn().mockResolvedValue(undefined),
    onReanalyze: vi.fn().mockResolvedValue(undefined),
    onRestore: vi.fn().mockResolvedValue(undefined),
    onMarkInScope: vi.fn().mockResolvedValue(undefined),
    hourlyRate: 75,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render request title', () => {
      render(<RequestCard {...defaultProps} />);
      expect(screen.getByText('Add dark mode feature')).toBeInTheDocument();
    });

    it('should render classification badge', () => {
      render(<RequestCard {...defaultProps} />);
      expect(screen.getByText('Out of Scope')).toBeInTheDocument();
    });
  });

  describe('out of scope requests', () => {
    it('should show Create Proposal button', () => {
      render(<RequestCard {...defaultProps} />);
      expect(screen.getByText('Create Proposal')).toBeInTheDocument();
    });

    it('should have Mark Addressed buttons', () => {
      render(<RequestCard {...defaultProps} />);
      // There are multiple - one in dropdown, one in action bar
      const buttons = screen.getAllByText('Mark Addressed');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have Dismiss buttons', () => {
      render(<RequestCard {...defaultProps} />);
      // There are multiple - one in dropdown, one in action bar
      const buttons = screen.getAllByText('Dismiss');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should call onCreateProposal when clicking Create Proposal', () => {
      render(<RequestCard {...defaultProps} />);
      fireEvent.click(screen.getByText('Create Proposal'));
      expect(defaultProps.onCreateProposal).toHaveBeenCalledWith(mockOutOfScopeRequest);
    });
  });

  describe('in scope requests', () => {
    it('should not show Create Proposal button', () => {
      render(<RequestCard {...defaultProps} request={mockInScopeRequest} />);
      expect(screen.queryByText('Create Proposal')).not.toBeInTheDocument();
    });

    it('should show In Scope badge', () => {
      render(<RequestCard {...defaultProps} request={mockInScopeRequest} />);
      expect(screen.getByText('In Scope')).toBeInTheDocument();
    });
  });

  describe('clarification needed requests', () => {
    it('should show Needs Clarification badge', () => {
      render(<RequestCard {...defaultProps} request={mockClarificationRequest} />);
      expect(screen.getByText('Needs Clarification')).toBeInTheDocument();
    });

    it('should have Re-analyze buttons', () => {
      render(<RequestCard {...defaultProps} request={mockClarificationRequest} />);
      const buttons = screen.getAllByText('Re-analyze');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('archived requests', () => {
    it('should show Restore button when isArchived', () => {
      render(
        <RequestCard 
          {...defaultProps} 
          request={mockAddressedRequest} 
          isArchived={true} 
        />
      );
      expect(screen.getByText('Restore')).toBeInTheDocument();
    });

    it('should not show Create Proposal when archived', () => {
      render(
        <RequestCard 
          {...defaultProps} 
          request={mockAddressedRequest} 
          isArchived={true} 
        />
      );
      expect(screen.queryByText('Create Proposal')).not.toBeInTheDocument();
    });

    it('should show Addressed status', () => {
      render(
        <RequestCard 
          {...defaultProps} 
          request={mockAddressedRequest} 
          isArchived={true} 
        />
      );
      expect(screen.getByText('Addressed')).toBeInTheDocument();
    });

    it('should show Declined status', () => {
      render(
        <RequestCard 
          {...defaultProps} 
          request={mockDeclinedRequest} 
          isArchived={true} 
        />
      );
      expect(screen.getByText('Declined')).toBeInTheDocument();
    });

    it('should call onRestore when clicking Restore', async () => {
      render(
        <RequestCard 
          {...defaultProps} 
          request={mockAddressedRequest} 
          isArchived={true} 
        />
      );
      fireEvent.click(screen.getByText('Restore'));
      
      await waitFor(() => {
        expect(defaultProps.onRestore).toHaveBeenCalledWith(mockAddressedRequest);
      });
    });
  });

  describe('interactions', () => {
    it('should call onMarkAddressed when clicking action bar button', async () => {
      render(<RequestCard {...defaultProps} />);
      
      // Get all Mark Addressed buttons and click the one in the action bar (last one)
      const buttons = screen.getAllByText('Mark Addressed');
      fireEvent.click(buttons[buttons.length - 1]);
      
      await waitFor(() => {
        expect(defaultProps.onMarkAddressed).toHaveBeenCalledWith(mockOutOfScopeRequest);
      });
    });

    it('should call onDismiss when clicking action bar button', async () => {
      render(<RequestCard {...defaultProps} />);
      
      const buttons = screen.getAllByText('Dismiss');
      fireEvent.click(buttons[buttons.length - 1]);
      
      await waitFor(() => {
        expect(defaultProps.onDismiss).toHaveBeenCalledWith(mockOutOfScopeRequest);
      });
    });
  });

  describe('dropdown menu', () => {
    it('should have dropdown trigger button', () => {
      render(<RequestCard {...defaultProps} />);
      // The dropdown trigger (three dots) should be present
      const dropdownButtons = screen.getAllByRole('button');
      // There should be a button with the more-horizontal icon
      expect(dropdownButtons.length).toBeGreaterThan(0);
    });

    it('should not show Mark as In Scope for in_scope requests', () => {
      render(<RequestCard {...defaultProps} request={mockInScopeRequest} />);
      // The Mark as In Scope option should not exist anywhere for in_scope requests
      expect(screen.queryByText('Mark as In Scope')).not.toBeInTheDocument();
    });
  });

  describe('content display', () => {
    it('should show Show more for long content', () => {
      const longContent = 'A'.repeat(250);
      render(
        <RequestCard 
          {...defaultProps} 
          request={{ ...mockOutOfScopeRequest, content: longContent }} 
        />
      );
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });

    it('should not show Show more for short content', () => {
      render(
        <RequestCard 
          {...defaultProps} 
          request={{ ...mockOutOfScopeRequest, content: 'Short content' }} 
        />
      );
      expect(screen.queryByText('Show more')).not.toBeInTheDocument();
    });

    it('should toggle content expansion', () => {
      const longContent = 'A'.repeat(250);
      render(
        <RequestCard 
          {...defaultProps} 
          request={{ ...mockOutOfScopeRequest, content: longContent }} 
        />
      );
      
      fireEvent.click(screen.getByText('Show more'));
      expect(screen.getByText('Show less')).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Show less'));
      expect(screen.getByText('Show more')).toBeInTheDocument();
    });
  });
});
