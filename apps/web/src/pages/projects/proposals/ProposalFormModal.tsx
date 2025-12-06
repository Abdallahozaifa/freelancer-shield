import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  AlignLeft, 
  DollarSign, 
  Clock, 
  Link as LinkIcon,
  Calculator
} from 'lucide-react';
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
          title: sourceRequestTitle ? `Proposal for: ${sourceRequestTitle}` : '',
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
      newErrors.amount = 'Amount must be positive';
    }

    if (formData.estimated_hours && (isNaN(Number(formData.estimated_hours)) || Number(formData.estimated_hours) < 0)) {
      newErrors.estimated_hours = 'Hours must be positive';
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
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Proposal Details' : 'Draft New Proposal'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* --- Context Banner --- */}
        {sourceRequestTitle && !isEditing && (
          <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900">
            <div className="p-1.5 bg-indigo-100 rounded-md text-indigo-600">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold block text-indigo-700 text-xs uppercase tracking-wide">Linked Request</span>
              <span className="font-medium truncate block max-w-md">"{sourceRequestTitle}"</span>
            </div>
          </div>
        )}

        {/* --- Section 1: Details --- */}
        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5 relative">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              Proposal Title <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <Input
                value={formData.title}
                onChange={handleChange('title')}
                error={errors.title}
                placeholder="e.g., Mobile Responsive Design Update"
                className="pl-9"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              Scope Description
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-3 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                <AlignLeft className="w-4 h-4" />
              </div>
              <Textarea
                value={formData.description}
                onChange={handleChange('description')}
                placeholder="Detail the exact deliverables, assumptions, and out-of-scope items..."
                rows={4}
                className="pl-9 resize-none"
              />
            </div>
          </div>
        </div>

        {/* --- Section 2: Financials (Grouped) --- */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200/60 text-slate-500">
            <Calculator className="w-4 h-4" />
            <h3 className="text-xs font-bold uppercase tracking-wide">Pricing & Estimates</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Amount */}
            <div className="space-y-1.5 relative">
              <label className="text-sm font-semibold text-slate-700">
                Total Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  <DollarSign className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange('amount')}
                  error={errors.amount}
                  placeholder="0.00"
                  className="pl-9 bg-white"
                />
              </div>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-1.5 relative">
              <label className="text-sm font-semibold text-slate-700">
                Estimated Hours
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  <Clock className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimated_hours}
                  onChange={handleChange('estimated_hours')}
                  error={errors.estimated_hours}
                  placeholder="0.0"
                  className="pl-9 bg-white"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 italic mt-2">
            * This amount will be presented to the client for approval.
          </p>
        </div>

        {/* --- Footer --- */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isSubmitting}
            className="shadow-lg shadow-indigo-500/20 px-6"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Draft Proposal'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};