import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Brain, Loader2 } from 'lucide-react';
import { Modal, Button, Input, Textarea, Select } from '../../../components/ui';
import { RequestClassificationBadge } from './RequestClassificationBadge';
import { cn } from '../../../utils/cn';
import type { RequestSource, ClientRequest, ScopeAnalysisResult } from '../../../types';

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
    }
  }, [isOpen, reset]);

  const handleClose = () => {
    onClose();
  };

  const onFormSubmit = async (data: FormFields) => {
    setError(null);

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
  };

  const isLoading = submitState === 'submitting';
  const isComplete = submitState === 'complete';

  // Get confidence as a number
  const confidencePercent = createdRequest?.confidence 
    ? Math.round(Number(createdRequest.confidence) * 100) 
    : null;

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
              {...register('content', { required: 'Content is required' })}
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

          {/* AI Analysis Note */}
          <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <Brain className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <p className="text-sm text-indigo-700">
              AI will automatically analyze this request for scope creep
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              <div>
                <p className="text-sm font-medium text-indigo-900">
                  Creating and analyzing request...
                </p>
                <p className="text-xs text-indigo-600">
                  AI is reviewing for scope creep
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} disabled={isLoading || externalSubmitting}>
              {isLoading ? 'Analyzing...' : 'Log Request'}
            </Button>
          </div>
        </form>
      ) : (
        /* Success State */
        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <Brain className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Request Logged & Analyzed</h3>
          </div>

          {/* Analysis Result */}
          {createdRequest && (
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Classification:</span>
                <RequestClassificationBadge classification={createdRequest.classification} />
              </div>
              
              {confidencePercent !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confidence:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          createdRequest.classification === 'out_of_scope'
                            ? 'bg-red-500'
                            : createdRequest.classification === 'in_scope'
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        )}
                        style={{ width: `${confidencePercent}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {confidencePercent}%
                    </span>
                  </div>
                </div>
              )}

              {createdRequest.analysis_reasoning && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-gray-500 mb-1">Analysis:</p>
                  <p className="text-sm text-gray-700">{createdRequest.analysis_reasoning}</p>
                </div>
              )}

              {createdRequest.suggested_action && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-1">Suggested Action:</p>
                  <p className="text-sm text-indigo-700 bg-indigo-50 p-2 rounded">
                    {createdRequest.suggested_action}
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
