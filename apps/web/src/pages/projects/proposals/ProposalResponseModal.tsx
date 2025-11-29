import React, { useState } from 'react';
import { CheckCircle, XCircle, DollarSign, PartyPopper } from 'lucide-react';
import { Modal, Button, Textarea } from '../../../components/ui';
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
  const [selectedResponse, setSelectedResponse] = useState<ResponseType | null>(initialResponse || null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!proposal) return null;

  const handleSubmit = async () => {
    if (!selectedResponse) return;

    setIsSubmitting(true);
    try {
      if (selectedResponse === 'accept') {
        await onAccept();
      } else {
        await onDecline();
      }
      onClose();
    } catch (error) {
      console.error('Failed to update proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedResponse(initialResponse || null);
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Record Client Response"
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

        {/* Response Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Client Response
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedResponse('accept')}
              className={cn(
                'flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
                selectedResponse === 'accept'
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-600'
              )}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Accepted</span>
            </button>
            
            <button
              type="button"
              onClick={() => setSelectedResponse('decline')}
              className={cn(
                'flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all',
                selectedResponse === 'decline'
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50 text-gray-600'
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

        {/* Notes (optional) */}
        <Textarea
          label="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about the client's response..."
          rows={2}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!selectedResponse || isSubmitting}
            className={cn(
              selectedResponse === 'accept' && 'bg-green-600 hover:bg-green-700',
              selectedResponse === 'decline' && 'bg-red-600 hover:bg-red-700'
            )}
          >
            {isSubmitting
              ? 'Saving...'
              : selectedResponse === 'accept'
              ? 'Mark as Accepted'
              : selectedResponse === 'decline'
              ? 'Mark as Declined'
              : 'Select Response'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
