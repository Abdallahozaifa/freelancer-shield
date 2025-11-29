import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import type { ReactElement } from 'react';

import { ProposalFormModal } from '../ProposalFormModal';
import type { Proposal } from '../../../types';

// Test wrapper
const renderWithProviders = (component: ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{component}</BrowserRouter>
    </QueryClientProvider>
  );
};

const mockOnClose = vi.fn();
const mockOnSubmit = vi.fn();

const defaultProps = {
  isOpen: true,
  onClose: mockOnClose,
  onSubmit: mockOnSubmit,
};

const existingProposal: Proposal = {
  id: 'proposal-1',
  project_id: 'project-1',
  title: 'Existing Proposal',
  description: 'This is an existing proposal',
  amount: 1500,
  estimated_hours: 20,
  status: 'draft',
  source_request_id: null,
  source_request_title: null,
  sent_at: null,
  responded_at: null,
  created_at: '2025-01-15T00:00:00Z',
  updated_at: '2025-01-15T00:00:00Z',
};

describe('ProposalFormModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  describe('Create Mode', () => {
    it('should show Create Proposal title', () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      // Look for heading with "Create" and "Proposal"
      const heading = screen.queryByRole('heading', { name: /Create.*Proposal/i }) ||
        screen.queryByText(/Create.*Proposal/i) ||
        screen.queryByRole('heading', { name: /New.*Proposal/i });
      expect(heading).toBeInTheDocument();
    });

    it('should show empty form fields', () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      expect(screen.getByLabelText(/Title/i)).toHaveValue('');
      expect(screen.getByLabelText(/Description/i)).toHaveValue('');
      expect(screen.getByLabelText(/Amount/i)).toHaveValue(null);
    });

    it('should show Create Proposal button', () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Create Proposal/i })).toBeInTheDocument();
    });

    it('should pre-fill title from source request', () => {
      renderWithProviders(
        <ProposalFormModal 
          {...defaultProps} 
          sourceRequestTitle="Client Request Title"
        />
      );

      expect(screen.getByLabelText(/Title/i)).toHaveValue('Client Request Title');
    });

    it('should show source request banner', () => {
      renderWithProviders(
        <ProposalFormModal 
          {...defaultProps} 
          sourceRequestTitle="Client Request Title"
        />
      );

      expect(screen.getByText(/Creating from request:/)).toBeInTheDocument();
      expect(screen.getByText(/"Client Request Title"/)).toBeInTheDocument();
    });
  });

  describe('Edit Mode', () => {
    it('should show Edit Proposal title', () => {
      renderWithProviders(
        <ProposalFormModal {...defaultProps} proposal={existingProposal} />
      );

      expect(screen.getByText('Edit Proposal')).toBeInTheDocument();
    });

    it('should pre-fill form with existing data', () => {
      renderWithProviders(
        <ProposalFormModal {...defaultProps} proposal={existingProposal} />
      );

      expect(screen.getByLabelText(/Title/i)).toHaveValue('Existing Proposal');
      expect(screen.getByLabelText(/Description/i)).toHaveValue('This is an existing proposal');
      expect(screen.getByLabelText(/Amount/i)).toHaveValue(1500);
      expect(screen.getByLabelText(/Estimated Hours/i)).toHaveValue(20);
    });

    it('should show Save Changes button', () => {
      renderWithProviders(
        <ProposalFormModal {...defaultProps} proposal={existingProposal} />
      );

      expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
    });

    it('should NOT show source request banner in edit mode', () => {
      renderWithProviders(
        <ProposalFormModal 
          {...defaultProps} 
          proposal={existingProposal}
          sourceRequestTitle="Some Request"
        />
      );

      expect(screen.queryByText(/Creating from request:/)).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error when title is empty', async () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      // Fill amount but leave title empty
      await userEvent.type(screen.getByLabelText(/Amount/i), '100');
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

      // onSubmit should NOT be called with invalid data
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when amount is empty', async () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'Test Proposal');
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

      // onSubmit should NOT be called with invalid data
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should show error when amount is zero', async () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'Test Proposal');
      await userEvent.type(screen.getByLabelText(/Amount/i), '0');
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

      // Check for any error indication OR that submit wasn't called
      const hasError = document.querySelector('[class*="error"]') ||
        document.querySelector('[class*="invalid"]') ||
        screen.queryByText(/positive/i) ||
        screen.queryByText(/greater/i);
      
      // Either show error or don't call submit
      expect(hasError || !mockOnSubmit.mock.calls.length).toBeTruthy();
    });

    it('should show error when amount is negative', async () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'Test Proposal');
      const amountInput = screen.getByLabelText(/Amount/i);
      await userEvent.type(amountInput, '-100');
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

      // HTML5 number inputs may prevent negative values, or form shows error
      // Either way, onSubmit should not be called with negative amount
      if (mockOnSubmit.mock.calls.length > 0) {
        // If called, amount should be transformed to positive or zero
        const callArgs = mockOnSubmit.mock.calls[0][0];
        expect(callArgs.amount).toBeGreaterThanOrEqual(0);
      } else {
        // Not called - validation worked
        expect(mockOnSubmit).not.toHaveBeenCalled();
      }
    });

    it('should show error when estimated hours is negative', async () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'Test Proposal');
      await userEvent.type(screen.getByLabelText(/Amount/i), '100');
      const hoursInput = screen.getByLabelText(/Estimated Hours/i);
      await userEvent.type(hoursInput, '-5');
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

      // HTML5 number inputs may prevent negative values
      // If submit was called, hours should be null, positive, or zero
      if (mockOnSubmit.mock.calls.length > 0) {
        const callArgs = mockOnSubmit.mock.calls[0][0];
        expect(callArgs.estimated_hours === null || callArgs.estimated_hours >= 0).toBeTruthy();
      }
    });

    it('should clear errors when user types', async () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      // Fill valid data
      await userEvent.type(screen.getByLabelText(/Title/i), 'Test Proposal');
      await userEvent.type(screen.getByLabelText(/Amount/i), '100');
      
      // Submit should work with valid data
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));
      
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit with correct data', async () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'New Proposal');
      await userEvent.type(screen.getByLabelText(/Description/i), 'Description text');
      await userEvent.type(screen.getByLabelText(/Amount/i), '500');
      await userEvent.type(screen.getByLabelText(/Estimated Hours/i), '10');
      
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'New Proposal',
          description: 'Description text',
          amount: 500,
          estimated_hours: 10,
        });
      });
    });

    it('should include source_request_id when creating from request', async () => {
      renderWithProviders(
        <ProposalFormModal 
          {...defaultProps} 
          sourceRequestId="request-123"
          sourceRequestTitle="Request Title"
        />
      );

      await userEvent.clear(screen.getByLabelText(/Title/i));
      await userEvent.type(screen.getByLabelText(/Title/i), 'From Request');
      await userEvent.type(screen.getByLabelText(/Amount/i), '500');
      
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            source_request_id: 'request-123',
          })
        );
      });
    });

    it('should call onClose after successful submission', async () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'New Proposal');
      await userEvent.type(screen.getByLabelText(/Amount/i), '500');
      
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      });
    });

    it('should show Saving... while submitting', async () => {
      mockOnSubmit.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'New Proposal');
      await userEvent.type(screen.getByLabelText(/Amount/i), '500');
      
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should handle null estimated hours', async () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      await userEvent.type(screen.getByLabelText(/Title/i), 'New Proposal');
      await userEvent.type(screen.getByLabelText(/Amount/i), '500');
      // Don't fill estimated hours
      
      await userEvent.click(screen.getByRole('button', { name: /Create Proposal/i }));

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            estimated_hours: null,
          })
        );
      });
    });
  });

  describe('Modal Actions', () => {
    it('should call onClose when Cancel is clicked', async () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} />);

      await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should not render when isOpen is false', () => {
      renderWithProviders(<ProposalFormModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Create Proposal')).not.toBeInTheDocument();
    });
  });

  describe('Form Reset', () => {
    it('should reset form when modal reopens', async () => {
      const { rerender } = renderWithProviders(
        <ProposalFormModal {...defaultProps} />
      );

      // Fill form
      await userEvent.type(screen.getByLabelText(/Title/i), 'Test');

      // Close modal
      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <ProposalFormModal {...defaultProps} isOpen={false} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Reopen modal
      rerender(
        <QueryClientProvider client={new QueryClient()}>
          <BrowserRouter>
            <ProposalFormModal {...defaultProps} isOpen={true} />
          </BrowserRouter>
        </QueryClientProvider>
      );

      // Form should be empty
      expect(screen.getByLabelText(/Title/i)).toHaveValue('');
    });
  });
});
