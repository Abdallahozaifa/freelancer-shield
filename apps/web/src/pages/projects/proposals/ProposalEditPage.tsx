import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  AlignLeft,
  DollarSign,
  Clock,
  Calculator,
  Link as LinkIcon,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { Input, Textarea, Button, useToast } from '../../../components/ui';
import {
  useProposals,
  useCreateProposal,
  useUpdateProposal,
} from '../../../hooks/useApi';
import type { Proposal, ProposalCreate, ProposalUpdate } from '../../../types';

export const ProposalEditPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get('proposal');
  const sourceRequestId = searchParams.get('request');
  const sourceRequestTitle = searchParams.get('requestTitle');
  const navigate = useNavigate();
  const toast = useToast();

  const isEditing = !!proposalId;

  const { data: proposalsData, isLoading: isLoadingProposals } = useProposals(projectId!);
  const createProposal = useCreateProposal(projectId!);
  const updateProposal = useUpdateProposal(projectId!);

  const editingProposal = isEditing
    ? proposalsData?.items?.find((p) => p.id === proposalId)
    : null;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    estimated_hours: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingProposal) {
      setFormData({
        title: editingProposal.title,
        description: editingProposal.description || '',
        amount: editingProposal.amount.toString(),
        estimated_hours: editingProposal.estimated_hours?.toString() || '',
      });
    } else if (sourceRequestTitle) {
      setFormData(prev => ({
        ...prev,
        title: `Proposal for: ${decodeURIComponent(sourceRequestTitle)}`,
      }));
    }
  }, [editingProposal, sourceRequestTitle]);

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
    if (!validate() || !projectId) return;

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

      if (isEditing && proposalId) {
        await updateProposal.mutateAsync({ id: proposalId, data });
        toast.success('Proposal updated');
      } else {
        await createProposal.mutateAsync(data as ProposalCreate);
        toast.success('Proposal created');
      }
      navigate(`/projects/${projectId}?tab=proposals`);
    } catch (error) {
      toast.error(isEditing ? 'Failed to update proposal' : 'Failed to create proposal');
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

  const handleCancel = () => {
    navigate(`/projects/${projectId}?tab=proposals`);
  };

  if (isLoadingProposals && isEditing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (isEditing && !editingProposal && !isLoadingProposals) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Proposal not found</h2>
        <Button variant="outline" onClick={handleCancel}>
          Back to Proposals
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Cancel</span>
          </button>
          <h1 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit Proposal' : 'New Proposal'}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 pb-8 space-y-6">
        {/* Linked Request Banner */}
        {sourceRequestTitle && !isEditing && (
          <div className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 shrink-0">
              <LinkIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-semibold block text-indigo-700 text-xs uppercase tracking-wide">
                Linked Request
              </span>
              <span className="font-medium text-indigo-900 text-sm truncate block">
                "{decodeURIComponent(sourceRequestTitle)}"
              </span>
            </div>
          </div>
        )}

        {/* Title Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Proposal Title <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.title}
            onChange={handleChange('title')}
            placeholder="e.g., Mobile Responsive Design Update"
            error={errors.title}
            className="w-full text-base h-12"
          />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-slate-400" />
            Scope Description
          </label>
          <Textarea
            value={formData.description}
            onChange={handleChange('description')}
            placeholder="Detail the exact deliverables, assumptions, and out-of-scope items..."
            rows={5}
            className="resize-none text-base"
          />
          <p className="text-xs text-slate-400">
            Be specific about what's included to set clear expectations.
          </p>
        </div>

        {/* Pricing Section */}
        <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Calculator className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Pricing & Estimates
            </h3>
          </div>

          {/* Amount and Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Total Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <DollarSign className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={formData.amount}
                  onChange={handleChange('amount')}
                  placeholder="0.00"
                  error={errors.amount}
                  className="pl-9 text-base h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Est. Hours
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Clock className="w-4 h-4" />
                </div>
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  inputMode="decimal"
                  value={formData.estimated_hours}
                  onChange={handleChange('estimated_hours')}
                  placeholder="0.0"
                  error={errors.estimated_hours}
                  className="pl-9 text-base h-12"
                />
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic">
            * This amount will be presented to the client for approval.
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold shadow-lg shadow-indigo-500/20"
            isLoading={isSubmitting}
          >
            {isEditing ? 'Save Changes' : 'Create Proposal'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProposalEditPage;
