import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, DollarSign, PartyPopper, AlertTriangle } from 'lucide-react';
import { Modal, Button } from '../../../components/ui';
import { formatCurrency } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import type { Proposal } from '../../../types';

type ResponseType = 'accept' | 'decline';

interface ProposalResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => Promise<void>;
  onDecline: () => Promise<void>;
  proposal: Proposal | null;
  initialResponse?: ResponseType;
}

export const ProposalResponseModal: React.FC<ProposalResponseModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  proposal,
  initialResponse,
}) => {
  const [selectedResponse, setSelectedResponse] = useState<ResponseType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state with props when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedResponse(initialResponse || null);
      setIsSubmitting(false);
    }
  }, [isOpen, initialResponse]);

  if (!proposal) return null;

  const isConfirmationMode = !!initialResponse;
  const effectiveResponse = selectedResponse || initialResponse;

  const handleSubmit = async () => {
    if (!effectiveResponse) return;

    setIsSubmitting(true);
    try {
      if (effectiveResponse === 'accept') {
        await onAccept();
      } else {
        await onDecline();
      }
      // Reset state and close on success
      setSelectedResponse(null);
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      // Error is handled by parent, just reset submitting state
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedResponse(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isConfirmationMode ? `Confirm ${initialResponse === 'accept' ? 'Acceptance' : 'Decline'}` : "Record Client Response"}
      size="md"
    >
      <div className="space-y-4">
        {/* Proposal Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-1">{proposal.title}</h3>
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="font-bold text-green-600">{formatCurrency(proposal.amount)}</span>
          </div>
        </div>

        {/* Confirmation Mode - when initialResponse is provided */}
        {isConfirmationMode ? (
          <>
            {initialResponse === 'accept' ? (
              <div className="flex items-center gap-3 bg-green-100 border border-green-200 rounded-lg p-4">
                <PartyPopper className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Mark this proposal as accepted?</p>
                  <p className="text-green-600 mt-1">
                    This will add {formatCurrency(proposal.amount)} to your protected revenue.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-red-800">Mark this proposal as declined?</p>
                  <p className="text-red-600 mt-1">
                    The proposal will be marked as declined and moved to the All tab.
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Selection Mode - when no initialResponse (shouldn't normally happen) */
          <>
            {/* Response Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Client Response
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedResponse('accept')}
                  disabled={isSubmitting}
                  className={cn(
                    'flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
                    selectedResponse === 'accept'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-600',
                    isSubmitting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Accepted</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setSelectedResponse('decline')}
                  disabled={isSubmitting}
                  className={cn(
                    'flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
                    selectedResponse === 'decline'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50 text-gray-600',
                    isSubmitting && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Declined</span>
                </button>
              </div>
            </div>

            {/* Success Preview for Accept */}
            {selectedResponse === 'accept' && (
              <div className="flex items-center gap-3 bg-green-100 border border-green-200 rounded-lg p-3">
                <PartyPopper className="w-5 h-5 text-green-600" />
                <div className="text-sm">
                  <p className="font-medium text-green-800">Great news!</p>
                  <p className="text-green-600">
                    This will add {formatCurrency(proposal.amount)} to your protected revenue.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!effectiveResponse || isSubmitting}
            isLoading={isSubmitting}
            className={cn(
              effectiveResponse === 'accept' && 'bg-green-600 hover:bg-green-700',
              effectiveResponse === 'decline' && 'bg-red-600 hover:bg-red-700'
            )}
          >
            {isSubmitting
              ? 'Saving...'
              : effectiveResponse === 'accept'
              ? 'Mark as Accepted'
              : effectiveResponse === 'decline'
              ? 'Mark as Declined'
              : 'Select Response'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
