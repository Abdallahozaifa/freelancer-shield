import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  MessageSquare,
  AlignLeft,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle2,
  Mail,
  MessageCircle,
  Phone,
  Users,
  FileText,
  Loader2,
} from 'lucide-react';
import { Input, Textarea, Select, Button, useToast } from '../../../components/ui';
import { useRequests, useCreateRequest, useUpdateRequest } from '../../../hooks/useRequests';
import { RequestClassificationBadge } from './RequestClassificationBadge';
import type { RequestSource, ClientRequest } from '../../../types';
import { cn } from '../../../utils/cn';

interface FormData {
  title: string;
  content: string;
  source: RequestSource;
}

const sourceOptions = [
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'chat', label: 'Chat / Slack', icon: MessageCircle },
  { value: 'call', label: 'Phone Call', icon: Phone },
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'other', label: 'Other', icon: FileText },
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
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request');
  const navigate = useNavigate();
  const toast = useToast();

  const isEditing = !!requestId;

  const { data: requestsData, isLoading: isLoadingRequests } = useRequests(projectId!);
  const editingRequest = isEditing
    ? requestsData?.items?.find((r) => r.id === requestId) ||
      requestsData?.allItems?.find((r) => r.id === requestId)
    : null;

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
  const updateRequest = useUpdateRequest();

  // Load existing request data when editing
  useEffect(() => {
    if (editingRequest) {
      setFormData({
        title: editingRequest.title,
        content: editingRequest.content,
        source: editingRequest.source,
      });
    }
  }, [editingRequest]);

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
      if (isEditing && requestId) {
        await updateRequest.mutateAsync({
          projectId,
          requestId,
          data: formData,
        });
        toast.success('Request updated successfully');
        navigate(`/projects/${projectId}?tab=requests`);
      } else {
        const result = await createRequest.mutateAsync({
          projectId,
          data: formData,
        });
        setCreatedRequest(result);
        setSubmitState('complete');
        toast.success('Request logged successfully');
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update request' : 'Failed to log request');
      setSubmitState('idle');
    }
  };

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSourceSelect = (source: RequestSource) => {
    setFormData(prev => ({ ...prev, source }));
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

  // Loading state for edit mode
  if (isLoadingRequests && isEditing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Not found state for edit mode
  if (isEditing && !editingRequest && !isLoadingRequests) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Request not found</h2>
        <Button variant="outline" onClick={handleCancel}>
          Back to Requests
        </Button>
      </div>
    );
  }

  // Success State
  if (submitState === 'complete') {
    return (
      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button>
            <h1 className="text-lg font-semibold text-slate-900">Request Logged</h1>
            <div className="w-16" />
          </div>
        </div>

        {/* Success Content */}
        <div className="max-w-2xl mx-auto flex flex-col items-center justify-center p-4 sm:p-6 pt-8 sm:pt-12 space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Request Logged</h2>
            <p className="text-slate-500 text-sm sm:text-base max-w-xs mx-auto">
              The request has been added for triage.
            </p>
          </div>

          {/* Summary Card */}
          {createdRequest && (
            <div className="w-full bg-white rounded-xl border border-slate-200 p-4 sm:p-5 text-left shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Title</p>
                  <p className="font-medium text-slate-900 text-base sm:text-lg">{createdRequest.title}</p>
                </div>
                <RequestClassificationBadge classification={createdRequest.classification} size="sm" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="w-full space-y-3 pt-4">
            <Button
              onClick={handleLogAnother}
              className="w-full h-12 sm:h-14 text-base font-semibold"
            >
              Log Another Request
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="w-full h-12 sm:h-14 text-base"
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
        <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
          <button
            onClick={handleCancel}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors p-1 -ml-1"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Cancel</span>
          </button>
          <h1 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit Request' : 'Log Request'}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4 sm:p-6 pb-8 space-y-5 sm:space-y-6">
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
            className="w-full text-base h-12 sm:h-11"
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
          <p className="text-xs text-slate-400">
            Copy and paste the exact message from the client for accurate analysis.
          </p>
        </div>

        {/* Scope Creep Warning */}
        {detectedIndicators.length > 0 && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600 shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-amber-800">Potential Scope Creep Detected</p>
              <p className="text-xs sm:text-sm text-amber-700 mt-1 leading-relaxed">
                Found phrases like <span className="font-semibold">"{detectedIndicators[0]}"</span>
                {detectedIndicators.length > 1 && ` and ${detectedIndicators.length - 1} more`}.
                This request may be outside the original project scope.
              </p>
            </div>
          </div>
        )}

        {/* Source Selection - Visual Buttons on Mobile */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-slate-400" />
            Source
          </label>

          {/* Mobile: Visual Icon Buttons */}
          <div className="grid grid-cols-5 gap-2 sm:hidden">
            {sourceOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = formData.source === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSourceSelect(option.value as RequestSource)}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                  )}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    {option.value === 'chat' ? 'Chat' : option.value === 'other' ? 'Other' : option.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Desktop: Select Dropdown */}
          <Select
            value={formData.source}
            onChange={handleChange('source')}
            options={sourceOptions.map(o => ({ value: o.value, label: o.label }))}
            className="hidden sm:block w-full sm:w-1/2 text-base h-11"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-4 sm:pt-6">
          <Button
            type="submit"
            className="w-full h-14 text-base font-semibold shadow-lg shadow-indigo-500/20"
            isLoading={submitState === 'submitting'}
          >
            {submitState === 'submitting'
              ? (isEditing ? 'Saving...' : 'Logging...')
              : (isEditing ? 'Save Changes' : 'Log Request')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RequestEditPage;
