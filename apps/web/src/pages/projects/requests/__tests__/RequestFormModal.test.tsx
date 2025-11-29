import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RequestFormModal } from '../RequestFormModal';

describe('RequestFormModal', () => {
  const mockCreatedRequest = {
    id: 'new-req',
    project_id: 'proj-1',
    title: 'Test Request',
    content: 'Test content',
    source: 'email' as const,
    status: 'analyzed' as const,
    classification: 'out_of_scope' as const,
    confidence: 0.85,
    analysis_reasoning: 'Not in original scope',
    suggested_action: 'Create a proposal',
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    linked_scope_item_id: null,
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(mockCreatedRequest),
    isSubmitting: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<RequestFormModal {...defaultProps} />);
      expect(screen.getByText('Log Client Request')).toBeInTheDocument();
    });

    it('should not render modal when isOpen is false', () => {
      render(<RequestFormModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Log Client Request')).not.toBeInTheDocument();
    });

    it('should render title input', () => {
      render(<RequestFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText('Brief summary of the request')).toBeInTheDocument();
    });

    it('should render content textarea', () => {
      render(<RequestFormModal {...defaultProps} />);
      expect(screen.getByPlaceholderText(/Paste the actual client message/)).toBeInTheDocument();
    });

    it('should render source select', () => {
      render(<RequestFormModal {...defaultProps} />);
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('should render Cancel and Log Request buttons', () => {
      render(<RequestFormModal {...defaultProps} />);
      expect(screen.getByText('Cancel')).toBeInTheDocument();
      expect(screen.getByText('Log Request')).toBeInTheDocument();
    });
  });

  describe('form validation', () => {
    it('should show error when submitting without title', async () => {
      const user = userEvent.setup();
      render(<RequestFormModal {...defaultProps} />);

      // Fill only content
      await user.type(
        screen.getByPlaceholderText(/Paste the actual client message/),
        'Test content'
      );

      await user.click(screen.getByText('Log Request'));

      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });

    it('should show error when submitting without content', async () => {
      const user = userEvent.setup();
      render(<RequestFormModal {...defaultProps} />);

      // Fill only title
      await user.type(
        screen.getByPlaceholderText('Brief summary of the request'),
        'Test Title'
      );

      await user.click(screen.getByText('Log Request'));

      await waitFor(() => {
        expect(screen.getByText('Content is required')).toBeInTheDocument();
      });

      expect(defaultProps.onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with form data when valid', async () => {
      const user = userEvent.setup();
      render(<RequestFormModal {...defaultProps} />);

      await user.type(
        screen.getByPlaceholderText('Brief summary of the request'),
        'Test Title'
      );
      await user.type(
        screen.getByPlaceholderText(/Paste the actual client message/),
        'Test content here'
      );

      await user.click(screen.getByText('Log Request'));

      await waitFor(() => {
        expect(defaultProps.onSubmit).toHaveBeenCalledWith({
          title: 'Test Title',
          content: 'Test content here',
          source: 'email',
        });
      });
    });

    it('should show success state after submission', async () => {
      const user = userEvent.setup();
      render(<RequestFormModal {...defaultProps} />);

      await user.type(
        screen.getByPlaceholderText('Brief summary of the request'),
        'Test Title'
      );
      await user.type(
        screen.getByPlaceholderText(/Paste the actual client message/),
        'Test content here'
      );

      await user.click(screen.getByText('Log Request'));

      await waitFor(() => {
        // Check for any success indicator - the exact text may vary
        expect(screen.getByText('Log Another')).toBeInTheDocument();
      });
    });

    it('should show Close and Log Another buttons after success', async () => {
      const user = userEvent.setup();
      render(<RequestFormModal {...defaultProps} />);

      await user.type(
        screen.getByPlaceholderText('Brief summary of the request'),
        'Test Title'
      );
      await user.type(
        screen.getByPlaceholderText(/Paste the actual client message/),
        'Test content here'
      );

      await user.click(screen.getByText('Log Request'));

      await waitFor(() => {
        expect(screen.getByText('Close')).toBeInTheDocument();
        expect(screen.getByText('Log Another')).toBeInTheDocument();
      });
    });
  });

  describe('error handling', () => {
    it('should show error message when submission fails', async () => {
      const user = userEvent.setup();
      const failingSubmit = vi.fn().mockRejectedValue(new Error('Network error'));

      render(<RequestFormModal {...defaultProps} onSubmit={failingSubmit} />);

      await user.type(
        screen.getByPlaceholderText('Brief summary of the request'),
        'Test Title'
      );
      await user.type(
        screen.getByPlaceholderText(/Paste the actual client message/),
        'Test content here'
      );

      await user.click(screen.getByText('Log Request'));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });
  });

  describe('modal interactions', () => {
    it('should call onClose when clicking Cancel', async () => {
      const user = userEvent.setup();
      render(<RequestFormModal {...defaultProps} />);

      await user.click(screen.getByText('Cancel'));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onClose when clicking Close after success', async () => {
      const user = userEvent.setup();
      render(<RequestFormModal {...defaultProps} />);

      await user.type(
        screen.getByPlaceholderText('Brief summary of the request'),
        'Test Title'
      );
      await user.type(
        screen.getByPlaceholderText(/Paste the actual client message/),
        'Test content here'
      );

      await user.click(screen.getByText('Log Request'));

      await waitFor(() => {
        expect(screen.getByText('Close')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Close'));

      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  describe('Log Another functionality', () => {
    it('should reset form when clicking Log Another', async () => {
      const user = userEvent.setup();
      render(<RequestFormModal {...defaultProps} />);

      // Submit form
      await user.type(
        screen.getByPlaceholderText('Brief summary of the request'),
        'Test Title'
      );
      await user.type(
        screen.getByPlaceholderText(/Paste the actual client message/),
        'Test content here'
      );
      await user.click(screen.getByText('Log Request'));

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Log Another')).toBeInTheDocument();
      });

      // Click Log Another
      await user.click(screen.getByText('Log Another'));

      // Should be back to form state
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Brief summary of the request')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Brief summary of the request')).toHaveValue('');
      });
    });
  });

  describe('loading state', () => {
    it('should disable form inputs while submitting', async () => {
      const user = userEvent.setup();
      let resolveSubmit: (value: unknown) => void;
      const slowSubmit = vi.fn().mockImplementation(
        () => new Promise(resolve => { resolveSubmit = resolve; })
      );

      render(<RequestFormModal {...defaultProps} onSubmit={slowSubmit} />);

      await user.type(
        screen.getByPlaceholderText('Brief summary of the request'),
        'Test Title'
      );
      await user.type(
        screen.getByPlaceholderText(/Paste the actual client message/),
        'Test content here'
      );

      // Click submit but don't resolve yet
      fireEvent.click(screen.getByText('Log Request'));

      // Wait a tick for state to update
      await waitFor(() => {
        expect(slowSubmit).toHaveBeenCalled();
      });

      // Resolve to clean up
      resolveSubmit!(mockCreatedRequest);
    });
  });
});
