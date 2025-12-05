import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
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

interface FormFields {
  title: string;
  content: string;
  source: RequestSource;
}

const sourceOptions = [
  { value: 'email', label: 'Email' },
  { value: 'chat', label: 'Chat/Slack' },
  { value: 'call', label: 'Phone Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' },
];

// Scope creep indicator phrases
const scopeCreepPhrases = [
  'also', 'as well', 'additionally', "shouldn't take long", "won't take long",
  'quick addition', 'just a small', "while you're at it", 'one more thing',
  'can you also', 'easy change', 'simple update', 'real quick', "shouldn't be hard",
  'just wondering', 'btw', 'by the way', 'quick question', 'small tweak',
  'minor change', 'tiny update',
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
  const [error, setError] = useState<string | null>(null);
  const [detectedIndicators, setDetectedIndicators] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    defaultValues: {
      title: '',
      content: '',
      source: 'email',
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      reset({
        title: '',
        content: '',
        source: 'email',
      });
      setSubmitState('idle');
      setCreatedRequest(null);
      setError(null);
      setDetectedIndicators([]);
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    onClose();
  };

  // Detect scope creep when user stops typing (on blur)
  const handleContentBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    if (content) {
      const indicators = detectScopeCreepIndicators(content);
      setDetectedIndicators(indicators);
    } else {
      setDetectedIndicators([]);
    }
  };

  const onFormSubmit = async (data: FormFields) => {
    setError(null);
    
    // Run detection on submit as well
    const indicators = detectScopeCreepIndicators(data.content);
    setDetectedIndicators(indicators);

    try {
      setSubmitState('submitting');
      const request = await onSubmit({
        title: data.title,
        content: data.content,
        source: data.source,
      });
      setCreatedRequest(request);
      setSubmitState('complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
      setSubmitState('idle');
    }
  };

  const handleLogAnother = () => {
    reset({
      title: '',
      content: '',
      source: 'email',
    });
    setSubmitState('idle');
    setCreatedRequest(null);
    setError(null);
    setDetectedIndicators([]);
  };

  const isLoading = submitState === 'submitting';
  const isComplete = submitState === 'complete';

  // Get the register props for content, then add onBlur
  const contentRegister = register('content', { required: 'Content is required' });

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Log Client Request" size="lg">
      {!isComplete ? (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('title', { required: 'Title is required' })}
              placeholder="Brief summary of the request"
              disabled={isLoading}
              error={errors.title?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request Content <span className="text-red-500">*</span>
            </label>
            <Textarea
              {...contentRegister}
              onBlur={(e) => {
                contentRegister.onBlur(e); // Call react-hook-form's onBlur
                handleContentBlur(e); // Then our custom handler
              }}
              placeholder="Paste the actual client message or describe their request..."
              rows={6}
              disabled={isLoading}
              error={errors.content?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source
            </label>
            <Select
              {...register('source')}
              options={sourceOptions}
              disabled={isLoading}
            />
          </div>

          {/* Scope Creep Detection Hint - shows after user finishes typing */}
          {detectedIndicators.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Potential scope creep detected
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Found: {detectedIndicators.map((ind, i) => (
                    <span key={i}>
                      <span className="font-medium">"{ind}"</span>
                      {i < detectedIndicators.length - 1 && ', '}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <p className="text-sm font-medium text-gray-700">
                Logging request...
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading || externalSubmitting}>
              {isLoading ? 'Saving...' : 'Log Request'}
            </Button>
          </div>
        </form>
      ) : (
        /* Success State */
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Request Logged</h3>
            <p className="text-sm text-gray-500 mt-1">
              You can now classify and take action on this request
            </p>
          </div>

          {/* Result Summary */}
          {createdRequest && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{createdRequest.title}</span>
                <RequestClassificationBadge classification={createdRequest.classification} />
              </div>
              
              {detectedIndicators.length > 0 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-amber-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Scope creep indicators detected - review and classify this request
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
            <Button onClick={handleLogAnother}>
              Log Another
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default RequestFormModal;
