import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  AlignLeft,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Input, Textarea, Select, Button, useToast } from '../../../components/ui';
import { useCreateRequest } from '../../../hooks/useRequests';
import { RequestClassificationBadge } from './RequestClassificationBadge';
import type { RequestSource, ClientRequest } from '../../../types';

interface FormData {
  title: string;
  content: string;
  source: RequestSource;
}

const sourceOptions = [
  { value: 'email', label: 'Email' },
  { value: 'chat', label: 'Chat / Slack' },
  { value: 'call', label: 'Phone Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other Source' },
];

const scopeCreepPhrases = [
  'also', 'as well', 'additionally', "shouldn't take long", "won't take long",
  'quick addition', 'just a small', "while you're at it", 'one more thing',
  'can you also', 'easy change', 'simple update', 'real quick', "shouldn't be hard"
];

const detectScopeCreepIndicators = (content: string): string[] => {
  const lowerContent = content.toLowerCase();
  return scopeCreepPhrases.filter(phrase =>
    lowerContent.includes(phrase.toLowerCase())
  ).slice(0, 3);
};

export const RequestEditPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    source: 'email',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [detectedIndicators, setDetectedIndicators] = useState<string[]>([]);
  const [createdRequest, setCreatedRequest] = useState<ClientRequest | null>(null);
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'complete'>('idle');

  const createRequest = useCreateRequest();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !projectId) return;

    setDetectedIndicators(detectScopeCreepIndicators(formData.content));
    setSubmitState('submitting');

    try {
      const result = await createRequest.mutateAsync({
        projectId,
        data: formData,
      });
      setCreatedRequest(result);
      setSubmitState('complete');
      toast.success('Request logged successfully');
    } catch (error) {
      toast.error('Failed to log request');
      setSubmitState('idle');
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleContentBlur = () => {
    setDetectedIndicators(formData.content ? detectScopeCreepIndicators(formData.content) : []);
  };

  const handleCancel = () => {
    navigate(`/projects/${projectId}?tab=requests`);
  };

  const handleLogAnother = () => {
    setFormData({ title: '', content: '', source: 'email' });
    setCreatedRequest(null);
    setSubmitState('idle');
    setDetectedIndicators([]);
    setErrors({});
  };

  // Success State
  if (submitState === 'complete') {
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
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Request Logged</h1>
            <div className="w-16" />
          </div>
        </div>

        {/* Success Content */}
        <div className="flex flex-col items-center justify-center p-6 pt-12 space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Request Logged</h2>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              The request has been added for triage.
            </p>
          </div>

          {/* Summary Card */}
          {createdRequest && (
            <div className="w-full bg-white rounded-xl border border-slate-200 p-4 text-left">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Title</p>
                  <p className="font-medium text-slate-900 truncate">{createdRequest.title}</p>
                </div>
                <RequestClassificationBadge classification={createdRequest.classification} size="sm" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="w-full space-y-3 pt-4">
            <Button
              onClick={handleLogAnother}
              className="w-full h-12 text-base"
            >
              Log Another Request
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full h-12 text-base"
            >
              Back to Requests
            </Button>
          </div>
        </div>
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
          <h1 className="text-lg font-semibold text-slate-900">Log Request</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 pb-8 space-y-6">
        {/* Title Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-400" />
            Request Summary <span className="text-red-500">*</span>
          </label>
          <Input
            value={formData.title}
            onChange={handleChange('title')}
            placeholder="e.g., Change login button color"
            error={errors.title}
            className="w-full text-base h-12"
          />
        </div>

        {/* Content Field */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <AlignLeft className="w-4 h-4 text-slate-400" />
            Original Message <span className="text-red-500">*</span>
          </label>
          <Textarea
            value={formData.content}
            onChange={handleChange('content')}
            onBlur={handleContentBlur}
            placeholder="Paste the client's message here..."
            rows={6}
            error={errors.content}
            className="resize-none text-base"
          />
        </div>

        {/* Scope Creep Warning */}
        {detectedIndicators.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800">Potential Scope Creep</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Found phrases like <span className="font-semibold">"{detectedIndicators[0]}"</span>.
              </p>
            </div>
          </div>
        )}

        {/* Source Selection */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-slate-400" />
            Source
          </label>
          <Select
            value={formData.source}
            onChange={handleChange('source')}
            options={sourceOptions}
            className="w-full text-base h-12"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold shadow-lg shadow-indigo-500/20"
            isLoading={submitState === 'submitting'}
          >
            {submitState === 'submitting' ? 'Logging...' : 'Log Request'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RequestEditPage;
