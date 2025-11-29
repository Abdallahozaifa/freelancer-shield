import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Textarea } from '../../../components/ui';
import type { Proposal, ProposalCreate, ProposalUpdate } from '../../../types';

interface ProposalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProposalCreate | ProposalUpdate) => Promise<void>;
  proposal?: Proposal | null;
  sourceRequestId?: string | null;
  sourceRequestTitle?: string | null;
}

export const ProposalFormModal: React.FC<ProposalFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  proposal,
  sourceRequestId,
  sourceRequestTitle,
}) => {
  const isEditing = !!proposal;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    estimated_hours: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (proposal) {
        setFormData({
          title: proposal.title,
          description: proposal.description || '',
          amount: proposal.amount.toString(),
          estimated_hours: proposal.estimated_hours?.toString() || '',
        });
      } else {
        setFormData({
          title: sourceRequestTitle || '',
          description: '',
          amount: '',
          estimated_hours: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, proposal, sourceRequestTitle]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }

    if (formData.estimated_hours && (isNaN(Number(formData.estimated_hours)) || Number(formData.estimated_hours) < 0)) {
      newErrors.estimated_hours = 'Hours must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data: ProposalCreate | ProposalUpdate = {
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        amount: Number(formData.amount),
        estimated_hours: formData.estimated_hours ? Number(formData.estimated_hours) : null,
      };

      if (!isEditing && sourceRequestId) {
        (data as ProposalCreate).source_request_id = sourceRequestId;
      }

      await onSubmit(data);
      onClose();
    } catch (error) {
      console.error('Failed to save proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Proposal' : 'Create Proposal'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {sourceRequestTitle && !isEditing && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
            <span className="text-blue-600 font-medium">Creating from request:</span>
            <span className="text-blue-800 ml-1">"{sourceRequestTitle}"</span>
          </div>
        )}

        <Input
          label="Title"
          value={formData.title}
          onChange={handleChange('title')}
          error={errors.title}
          placeholder="e.g., Mobile Responsive Design"
          required
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={handleChange('description')}
          placeholder="Describe the scope of work for this proposal..."
          rows={4}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount ($)"
            type="number"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange('amount')}
            error={errors.amount}
            placeholder="750.00"
            required
          />

          <Input
            label="Estimated Hours"
            type="number"
            min="0"
            step="0.5"
            value={formData.estimated_hours}
            onChange={handleChange('estimated_hours')}
            error={errors.estimated_hours}
            placeholder="10"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Proposal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
