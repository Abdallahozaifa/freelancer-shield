import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Loader2, CheckCircle2, AlertTriangle, 
  MessageSquare, AlignLeft, Link as LinkIcon 
} from 'lucide-react';
import { Modal, Button, Input, Textarea, Select } from '../../../components/ui';
import { RequestClassificationBadge } from './RequestClassificationBadge';
import type { RequestSource, ClientRequest } from '../../../types';

interface RequestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RequestFormData) => Promise<ClientRequest>;
  isSubmitting?: boolean;
}

export interface RequestFormData {
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

type SubmitState = 'idle' | 'submitting' | 'complete';

export const RequestFormModal: React.FC<RequestFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting: externalSubmitting,
}) => {
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [createdRequest, setCreatedRequest] = useState<ClientRequest | null>(null);
  const [detectedIndicators, setDetectedIndicators] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RequestFormData>({
    defaultValues: { title: '', content: '', source: 'email' },
  });

  useEffect(() => {
    if (!isOpen) {
      reset();
      setSubmitState('idle');
      setCreatedRequest(null);
      setDetectedIndicators([]);
    }
  }, [isOpen, reset]);

  const handleContentBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setDetectedIndicators(content ? detectScopeCreepIndicators(content) : []);
  };

  const onFormSubmit = async (data: RequestFormData) => {
    setDetectedIndicators(detectScopeCreepIndicators(data.content));
    try {
      setSubmitState('submitting');
      const request = await onSubmit(data);
      setCreatedRequest(request);
      setSubmitState('complete');
    } catch (err) {
      setSubmitState('idle');
    }
  };

  const contentRegister = register('content', { required: 'Content is required' });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Incoming Request" size="lg">
      
      {/* --- FORM STATE --- */}
      {submitState !== 'complete' ? (
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col gap-6">
          
          <div className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5 relative">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                Request Summary <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <Input
                  {...register('title', { required: 'Title is required' })}
                  placeholder="e.g., Change login button color"
                  disabled={submitState === 'submitting'}
                  error={errors.title?.message}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-1.5 relative">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                Original Message <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-3 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  <AlignLeft className="w-4 h-4" />
                </div>
                <Textarea
                  {...contentRegister}
                  onBlur={(e) => { contentRegister.onBlur(e); handleContentBlur(e); }}
                  placeholder="Paste the client's email, Slack message, or transcript here..."
                  rows={6}
                  disabled={submitState === 'submitting'}
                  error={errors.content?.message}
                  className="pl-9 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Source Selection */}
            <div className="space-y-1.5 relative w-1/2">
              <label className="text-sm font-semibold text-slate-700">Source</label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <Select
                  {...register('source')}
                  options={sourceOptions}
                  disabled={submitState === 'submitting'}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Scope Creep Warning (Dynamic) */}
          {detectedIndicators.length > 0 && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-lg animate-fade-in-up">
              <div className="p-1 bg-amber-100 rounded text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800">Potential Scope Creep Detected</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  We found phrases like <span className="font-semibold">"{detectedIndicators[0]}"</span>. 
                  This request likely falls outside the agreed scope.
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitState === 'submitting'}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              isLoading={submitState === 'submitting' || externalSubmitting}
              className="shadow-lg shadow-indigo-500/20"
            >
              Log Request
            </Button>
          </div>
        </form>
      ) : (
        
        /* --- SUCCESS STATE --- */
        <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Request Logged</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              The request has been added to your inbox for triage.
            </p>
          </div>

          {/* Mini Summary Card */}
          {createdRequest && (
            <div className="w-full bg-slate-50 rounded-xl border border-slate-200 p-4 text-left">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Title</p>
                  <p className="font-medium text-slate-900 truncate">{createdRequest.title}</p>
                </div>
                <RequestClassificationBadge classification={createdRequest.classification} />
              </div>
              {detectedIndicators.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center gap-2 text-xs text-amber-700 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Flags detected for review
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 w-full pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            <Button onClick={() => { reset(); setSubmitState('idle'); setCreatedRequest(null); setDetectedIndicators([]); }} className="flex-1">
              Log Another
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RequestFormModal;