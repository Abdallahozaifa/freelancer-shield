import React, { useState, useMemo } from 'react';
import {
  Mail,
  MessageCircle,
  Phone,
  Users,
  MoreHorizontal,
  CheckCircle,
  FileText,
  XCircle,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { Card, Button, Dropdown } from '../../../components/ui';
import { RequestClassificationBadge } from './RequestClassificationBadge';
import { AnalysisPanel } from './AnalysisPanel';
import { ScopeCreepAlert } from './ScopeCreepAlert';
import { cn } from '../../../utils/cn';
import { formatRelative } from '../../../utils/format';
import type { ClientRequest, RequestSource } from '../../../types';

interface RequestCardProps {
  request: ClientRequest;
  onCreateProposal: (request: ClientRequest) => void;
  onMarkAddressed: (request: ClientRequest) => Promise<void>;
  onDismiss: (request: ClientRequest) => Promise<void>;
  onReanalyze: (request: ClientRequest) => Promise<void>;
  onRestore?: (request: ClientRequest) => Promise<void>;
  onMarkInScope?: (request: ClientRequest) => Promise<void>;
  hourlyRate?: number | string | null;
  isArchived?: boolean;
}

const sourceIcons: Record<RequestSource, React.ElementType> = {
  email: Mail,
  chat: MessageCircle,
  call: Phone,
  meeting: Users,
  other: FileText,
};

const sourceLabels: Record<RequestSource, string> = {
  email: 'Email',
  chat: 'Chat',
  call: 'Call',
  meeting: 'Meeting',
  other: 'Other',
};

const scopeCreepPhrases = [
  'also', 'as well', 'additionally', "shouldn't take long", "won't take long",
  'quick addition', 'just a small', "while you're at it", 'one more thing',
  'can you also', 'easy change', 'simple update', 'real quick', "shouldn't be hard",
  'just wondering', 'btw', 'by the way', 'quick question', 'small tweak',
  'minor change', 'tiny update',
];

const highlightScopeCreepPhrases = (content: string): React.ReactNode => {
  let result: React.ReactNode[] = [];
  let lastIndex = 0;
  const lowerContent = content.toLowerCase();

  const matches: { start: number; end: number; phrase: string }[] = [];

  scopeCreepPhrases.forEach((phrase) => {
    let startIndex = 0;
    while (true) {
      const index = lowerContent.indexOf(phrase.toLowerCase(), startIndex);
      if (index === -1) break;
      matches.push({
        start: index,
        end: index + phrase.length,
        phrase: content.substring(index, index + phrase.length),
      });
      startIndex = index + 1;
    }
  });

  matches.sort((a, b) => a.start - b.start);
  const filteredMatches = matches.filter((match, index) => {
    if (index === 0) return true;
    return match.start >= matches[index - 1].end;
  });

  filteredMatches.forEach((match, index) => {
    if (match.start > lastIndex) {
      result.push(content.substring(lastIndex, match.start));
    }
    result.push(
      <mark key={index} className="bg-red-200 text-red-900 px-0.5 rounded">
        {match.phrase}
      </mark>
    );
    lastIndex = match.end;
  });

  if (lastIndex < content.length) {
    result.push(content.substring(lastIndex));
  }

  return result.length > 0 ? result : content;
};

const extractIndicators = (request: ClientRequest): string[] => {
  const indicators: string[] = [];
  const lowerContent = request.content.toLowerCase();

  scopeCreepPhrases.forEach((phrase) => {
    if (lowerContent.includes(phrase.toLowerCase())) {
      indicators.push(phrase);
    }
  });

  return indicators.slice(0, 5);
};

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onCreateProposal,
  onMarkAddressed,
  onDismiss,
  onReanalyze,
  onRestore,
  onMarkInScope,
  hourlyRate: hourlyRateProp,
  isArchived,
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [isAddressing, setIsAddressing] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isReanalyzingLocal, setIsReanalyzingLocal] = useState(false);
  const [isMarkingInScope, setIsMarkingInScope] = useState(false);

  const hourlyRate = hourlyRateProp ? Number(hourlyRateProp) : null;
  
  const SourceIcon = sourceIcons[request.source];
  const isOutOfScope = request.classification === 'out_of_scope';
  const isInScope = request.classification === 'in_scope';
  const isClarificationNeeded = request.classification === 'clarification_needed';
  const isAddressed = request.status === 'addressed';

  const indicators = useMemo(() => extractIndicators(request), [request]);

  const estimatedHours = isOutOfScope ? 4 : null;
  const suggestedAmount = hourlyRate && estimatedHours ? hourlyRate * estimatedHours : undefined;

  const contentPreview =
    request.content.length > 200 ? `${request.content.substring(0, 200)}...` : request.content;
  const displayContent = showFullContent ? request.content : contentPreview;

  const handleMarkAddressed = async () => {
    setIsAddressing(true);
    try {
      await onMarkAddressed(request);
    } finally {
      setIsAddressing(false);
    }
  };

  const handleDismiss = async () => {
    setIsDismissing(true);
    try {
      await onDismiss(request);
    } finally {
      setIsDismissing(false);
    }
  };

  const handleRestore = async () => {
    if (!onRestore) return;
    setIsRestoring(true);
    try {
      await onRestore(request);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleReanalyze = async () => {
    setIsReanalyzingLocal(true);
    try {
      await onReanalyze(request);
    } finally {
      setIsReanalyzingLocal(false);
    }
  };

  const handleMarkInScope = async () => {
    if (!onMarkInScope) return;
    setIsMarkingInScope(true);
    try {
      await onMarkInScope(request);
    } finally {
      setIsMarkingInScope(false);
    }
  };

  const isActionLoading = isAddressing || isDismissing || isRestoring || isReanalyzingLocal || isMarkingInScope;

  // Archived view - shows content but simpler actions
  if (isArchived) {
    return (
      <div className={cn(
        'border border-gray-200 rounded-lg bg-gray-50 transition-all',
        (isRestoring) && 'opacity-50'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-gray-200 text-gray-500">
              <SourceIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-gray-600">{request.title}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {sourceLabels[request.source]} • {formatRelative(request.created_at)} • 
                <span className={isAddressed ? 'text-green-600 ml-1' : 'text-gray-500 ml-1'}>
                  {isAddressed ? 'Addressed' : 'Declined'}
                </span>
              </p>
            </div>
          </div>
          <RequestClassificationBadge classification={request.classification} />
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-gray-500 italic">"{displayContent}"</p>
          {request.content.length > 200 && (
            <button
              type="button"
              onClick={() => setShowFullContent(!showFullContent)}
              className="text-xs text-indigo-600 hover:text-indigo-800 mt-2"
            >
              {showFullContent ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>

        {/* Restore Action */}
        <div className="flex justify-end p-4 pt-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestore}
            isLoading={isRestoring}
            disabled={isActionLoading}
            className="text-indigo-600 hover:text-indigo-800"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restore
          </Button>
        </div>
      </div>
    );
  }

  // Active view - full card
  const dropdownItems = [
    {
      label: 'Re-analyze',
      icon: <RefreshCw className="w-4 h-4" />,
      onClick: handleReanalyze,
    },
    // Show "Mark as In Scope" for out_of_scope and clarification_needed
    ...((isOutOfScope || isClarificationNeeded) && onMarkInScope ? [{
      label: 'Mark as In Scope',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: handleMarkInScope,
    }] : []),
    {
      label: 'Mark Addressed',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: handleMarkAddressed,
    },
    {
      label: 'Dismiss',
      icon: <XCircle className="w-4 h-4" />,
      onClick: handleDismiss,
      danger: true,
    },
  ];

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        isOutOfScope && 'border-red-300 shadow-red-100 shadow-md',
        (isDismissing || isAddressing) && 'opacity-50'
      )}
      padding="none"
    >
      {/* Card Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={cn(
              'flex-shrink-0 p-2 rounded-lg',
              isOutOfScope ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
            )}
          >
            <SourceIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 truncate">{request.title}</h3>
            <p className="text-xs text-gray-500 mt-1">
              {sourceLabels[request.source]} • {formatRelative(request.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <RequestClassificationBadge classification={request.classification} />
          <Dropdown
            trigger={
              <Button variant="ghost" size="sm" className="p-1">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            }
            items={dropdownItems}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 italic">
          "{isOutOfScope ? highlightScopeCreepPhrases(displayContent) : displayContent}"
        </div>
        {request.content.length > 200 && (
          <button
            type="button"
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-xs text-indigo-600 hover:text-indigo-800 mt-2"
          >
            {showFullContent ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {/* Scope Creep Alert */}
      {isOutOfScope && indicators.length > 0 && (
        <div className="px-4 pb-4">
          <ScopeCreepAlert
            indicators={indicators}
            suggestedAmount={suggestedAmount}
            onCreateProposal={() => onCreateProposal(request)}
          />
        </div>
      )}

      {/* In Scope Match */}
      {isInScope && request.linked_scope_item_id && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700">
              Matches Scope Item: <span className="font-medium">{request.linked_scope_item_id}</span>
            </span>
          </div>
        </div>
      )}

      {/* Analysis Panel */}
      {(request.analysis_reasoning || request.confidence !== null) && (
        <div className="px-4 pb-4">
          <AnalysisPanel
            classification={request.classification}
            confidence={request.confidence ? Number(request.confidence) : null}
            reasoning={request.analysis_reasoning}
            suggestedAction={request.suggested_action}
            matchedScopeItemId={request.linked_scope_item_id}
            indicators={isOutOfScope ? indicators : []}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 p-4 bg-gray-50 border-t border-gray-200">
        {isOutOfScope ? (
          <>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onCreateProposal(request)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isActionLoading}
            >
              Create Proposal
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAddressed}
              isLoading={isAddressing}
              disabled={isActionLoading}
            >
              Mark Addressed
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              isLoading={isDismissing}
              disabled={isActionLoading}
            >
              Dismiss
            </Button>
          </>
        ) : isInScope ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAddressed}
            isLoading={isAddressing}
            disabled={isActionLoading}
          >
            <CheckCircle className="w-4 h-4 mr-1" />
            Mark Complete
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAddressed}
              isLoading={isAddressing}
              disabled={isActionLoading}
            >
              Mark Addressed
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReanalyze}
              isLoading={isReanalyzingLocal}
              disabled={isActionLoading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Re-analyze
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default RequestCard;
