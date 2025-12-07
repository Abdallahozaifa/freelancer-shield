import React, { useState } from 'react';
import { Send, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { Modal, Button } from '../../../components/ui';
import { formatCurrency, formatHours } from '../../../utils/format';
import type { Proposal } from '../../../types';

interface SendProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  proposal: Proposal | null;
}

export const SendProposalModal: React.FC<SendProposalModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  proposal,
}) => {
  const [isSending, setIsSending] = useState(false);

  if (!proposal) return null;

  const handleConfirm = async () => {
    setIsSending(true);
    try {
      await onConfirm();
      // onClose is called in parent after successful send
    } catch (error) {
      // Error handling is done in parent component
      setIsSending(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Proposal"
      size="md"
    >
      <div className="space-y-4">
        {/* Proposal Summary */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-900">{proposal.title}</h3>
          
          {proposal.description && (
            <p className="text-sm text-gray-600">{proposal.description}</p>
          )}

          <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="font-bold text-green-600">{formatCurrency(proposal.amount)}</span>
            </div>
            {proposal.estimated_hours && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{formatHours(proposal.estimated_hours)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-lg p-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800">This will mark the proposal as sent</p>
            <p className="text-amber-600 mt-1">
              Once sent, you can track the client's response and mark it as accepted or declined.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            disabled={isSending}
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? 'Sending...' : 'Send to Client'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
