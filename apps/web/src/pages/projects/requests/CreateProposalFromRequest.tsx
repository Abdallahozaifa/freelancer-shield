import React, { useState, useEffect } from 'react';
import { DollarSign, Clock, FileText } from 'lucide-react';
import { Modal, Button, Input, Textarea } from '../../../components/ui';
import type { ClientRequest, ProposalCreate } from '../../../types';

interface CreateProposalFromRequestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProposalCreate) => Promise<void>;
  request: ClientRequest | null;
  hourlyRate?: number | string | null;
  isSubmitting?: boolean;
}

export const CreateProposalFromRequest: React.FC<CreateProposalFromRequestProps> = ({
  isOpen,
  onClose,
  onSubmit,
  request,
  hourlyRate: hourlyRateProp,
  isSubmitting,
}) => {
  // Convert hourlyRate to number safely
  const hourlyRate = hourlyRateProp ? Number(hourlyRateProp) : null;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    estimatedHours: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Pre-fill form when request changes
  useEffect(() => {
    if (request) {
      const defaultHours = 4;
      const calculatedAmount = hourlyRate ? hourlyRate * defaultHours : 0;
      
      setFormData({
        title: `Additional Work: ${request.title}`,
        description: `This proposal covers additional work requested by the client:\n\n"${request.content}"\n\nThis work was not included in the original project scope and will require additional time and resources.`,
        amount: calculatedAmount.toString(),
        estimatedHours: defaultHours.toString(),
      });
    }
  }, [request, hourlyRate]);

  // Recalculate amount when hours change
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hours = parseFloat(e.target.value) || 0;
    setFormData((prev) => ({
      ...prev,
      estimatedHours: e.target.value,
      amount: hourlyRate ? (hourlyRate * hours).toString() : prev.amount,
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        amount,
        estimated_hours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        source_request_id: request?.id,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create proposal');
    }
  };

  if (!request) return null;

  const estimatedHoursNum = parseFloat(formData.estimatedHours) || 0;
  const amountNum = parseFloat(formData.amount) || 0;
  const effectiveRate = estimatedHoursNum > 0 ? amountNum / estimatedHoursNum : (hourlyRate || 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Proposal" size="lg">
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Source Request Info */}
        <div className="p-2.5 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>From Request:</span>
          </div>
          <p className="font-medium text-gray-900 text-sm truncate">{request.title}</p>
        </div>

        <Input
          label="Proposal Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Title for this proposal"
          required
        />

        <Textarea
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the work to be done..."
          rows={4}
          required
          className="text-sm"
        />

        {/* Hours & Amount - Stack on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Hours
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                name="estimatedHours"
                value={formData.estimatedHours}
                onChange={handleHoursChange}
                placeholder="0"
                min="0"
                step="0.5"
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>
            {hourlyRate && (
              <p className="mt-1 text-[10px] sm:text-xs text-gray-500">
                @ ${Number(hourlyRate).toFixed(2)}/hr
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Summary Box */}
        <div className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-xs sm:text-sm font-medium text-green-800 mb-2">Proposal Summary</h4>
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
            <div>
              <p className="text-green-600">Hours</p>
              <p className="font-bold text-green-900">{estimatedHoursNum || '—'}</p>
            </div>
            <div>
              <p className="text-green-600">Rate</p>
              <p className="font-bold text-green-900 text-xs sm:text-sm">
                ${Number(effectiveRate).toFixed(0)}/hr
              </p>
            </div>
            <div>
              <p className="text-green-600">Total</p>
              <p className="font-bold text-green-900 text-sm sm:text-lg">
                ${amountNum.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Protection Message */}
        <div className="flex items-start gap-2 p-2.5 sm:p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-indigo-700">
            This proposal protects your earnings from scope creep.
          </p>
        </div>

        {error && (
          <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Footer - Stack on mobile */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Create ${amountNum.toLocaleString()} Proposal
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProposalFromRequest;
