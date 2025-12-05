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
  RotateCcw,
  DollarSign,
  HelpCircle,
} from 'lucide-react';
import { Card, Button, Dropdown } from '../../../components/ui';
import { RequestClassificationBadge } from './RequestClassificationBadge';
import { ScopeCreepAlert } from './ScopeCreepAlert';
import { cn } from '../../../utils/cn';
import { formatRelative } from '../../../utils/format';
import type { ClientRequest, RequestSource } from '../../../types';

interface RequestCardProps {
  request: ClientRequest;
  onCreateProposal: (request: ClientRequest) => void;
  onMarkAddressed: (request: ClientRequest) => Promise<void>;
  onDismiss: (request: ClientRequest) => Promise<void>;
  onRestore?: (request: ClientRequest) => Promise<void>;
  onMarkInScope?: (request: ClientRequest) => Promise<void>;
  onMarkOutOfScope?: (request: ClientRequest) => Promise<void>;
  onMarkClarificationNeeded?: (request: ClientRequest) => Promise<void>;
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

// Dynamic hours estimation based on content complexity
const estimateHours = (content: string): number => {
  const wordCount = content.split(/\s+/).length;
  const hasComplexKeywords = /api|database|integration|authentication|migration|refactor/i.test(content);
  const hasSimpleKeywords = /color|text|copy|typo|font|spacing|padding|margin/i.test(content);
  
  if (hasSimpleKeywords && wordCount < 30) return 1;
  if (wordCount < 20) return 2;
  if (wordCount < 50) return 4;
  if (hasComplexKeywords) return 8;
  return 4;
};

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onCreateProposal,
  onMarkAddressed,
  onDismiss,
  onRestore,
  onMarkInScope,
  onMarkOutOfScope,
  onMarkClarificationNeeded,
  hourlyRate: hourlyRateProp,
  isArchived,
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [isAddressing, setIsAddressing] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isMarkingInScope, setIsMarkingInScope] = useState(false);
  const [isMarkingOutOfScope, setIsMarkingOutOfScope] = useState(false);
  const [isMarkingClarification, setIsMarkingClarification] = useState(false);

  const hourlyRate = hourlyRateProp ? Number(hourlyRateProp) : null;
  
  const SourceIcon = sourceIcons[request.source];
  const isOutOfScope = request.classification === 'out_of_scope';
  const isInScope = request.classification === 'in_scope';
  const isClarificationNeeded = request.classification === 'clarification_needed';
  const isPending = request.classification === 'pending' || !request.classification;
  const isProposalSent = request.status === 'proposal_sent';

  const indicators = useMemo(() => extractIndicators(request), [request]);

  // Dynamic hours estimation based on content
  const estimatedHours = useMemo(() => {
    if (!isOutOfScope) return null;
    return estimateHours(request.content);
  }, [isOutOfScope, request.content]);

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

  const handleMarkInScope = async () => {
    if (!onMarkInScope) return;
    setIsMarkingInScope(true);
    try {
      await onMarkInScope(request);
    } finally {
      setIsMarkingInScope(false);
    }
  };

  const handleMarkOutOfScope = async () => {
    if (!onMarkOutOfScope) return;
    setIsMarkingOutOfScope(true);
    try {
      await onMarkOutOfScope(request);
    } finally {
      setIsMarkingOutOfScope(false);
    }
  };

  const handleMarkClarificationNeeded = async () => {
    if (!onMarkClarificationNeeded) return;
    setIsMarkingClarification(true);
    try {
      await onMarkClarificationNeeded(request);
    } finally {
      setIsMarkingClarification(false);
    }
  };

  const isActionLoading = isAddressing || isDismissing || isRestoring || isMarkingInScope || isMarkingOutOfScope || isMarkingClarification;

  // Archived view - shows content but simpler actions
  if (isArchived) {
    return (
      <div className={cn(
        'border rounded-lg transition-all',
        isProposalSent ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50',
        (isRestoring) && 'opacity-50'
      )}>
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-gray-200">
          <div className="flex items-start gap-3">
            <div className={cn(
              'p-2 rounded-lg',
              isProposalSent ? 'bg-green-200 text-green-600' : 'bg-gray-200 text-gray-500'
            )}>
              <SourceIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className={cn(
                'font-medium',
                isProposalSent ? 'text-green-800' : 'text-gray-600'
              )}>{request.title}</h3>
              <p className="text-xs text-gray-400 mt-1">
                {sourceLabels[request.source]} • {formatRelative(request.created_at)} • 
                <span className={cn(
                  'ml-1',
                  isProposalSent ? 'text-green-600' : ''
                )}>
                  {isProposalSent ? 'Proposal Sent' : request.status === 'addressed' ? 'Addressed' : 'Declined'}
                </span>
              </p>
            </div>
          </div>
          <RequestClassificationBadge classification={request.classification} />
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200 italic">
            "{displayContent}"
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

        {/* Restore Button */}
        <div className="flex items-center justify-end p-3 border-t border-gray-200">
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
    // Show "Mark as In Scope" for out_of_scope, clarification_needed, and pending
    ...((isOutOfScope || isClarificationNeeded || isPending) && onMarkInScope ? [{
      label: 'Mark as In Scope',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: handleMarkInScope,
    }] : []),
    // Show "Flag as Out of Scope" for in_scope, clarification_needed, and pending
    ...((isInScope || isClarificationNeeded || isPending) && onMarkOutOfScope ? [{
      label: 'Flag as Out of Scope',
      icon: <XCircle className="w-4 h-4" />,
      onClick: handleMarkOutOfScope,
    }] : []),
    // Show "Needs Clarification" for in_scope, out_of_scope, and pending
    ...((isInScope || isOutOfScope || isPending) && onMarkClarificationNeeded ? [{
      label: 'Needs Clarification',
      icon: <HelpCircle className="w-4 h-4" />,
      onClick: handleMarkClarificationNeeded,
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
        isClarificationNeeded && 'border-amber-300 shadow-amber-100 shadow-md',
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
              isOutOfScope ? 'bg-red-100 text-red-600' : 
              isClarificationNeeded ? 'bg-amber-100 text-amber-600' :
              'bg-gray-100 text-gray-500'
            )}
          >
            <SourceIcon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-gray-900 truncate">{request.title}</h3>
              {/* Prominent $ estimate in header for out-of-scope */}
              {isOutOfScope && suggestedAmount && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-sm font-semibold rounded-full whitespace-nowrap">
                  <DollarSign className="w-3 h-3" />
                  {suggestedAmount.toLocaleString()}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {sourceLabels[request.source]} • {formatRelative(request.created_at)}
              {isOutOfScope && estimatedHours && (
                <span className="text-red-600 ml-1">• ~{estimatedHours}h est.</span>
              )}
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

      {/* Scope Creep Alert - Rule-based indicators */}
      {isOutOfScope && indicators.length > 0 && (
        <div className="px-4 pb-4">
          <ScopeCreepAlert
            indicators={indicators}
            suggestedAmount={suggestedAmount}
            onCreateProposal={() => onCreateProposal(request)}
          />
        </div>
      )}

      {/* Clarification Needed Alert */}
      {isClarificationNeeded && (
        <div className="px-4 pb-4">
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <HelpCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800 font-medium">Needs clarification from client</p>
              <p className="text-xs text-amber-600 mt-1">
                Follow up with the client to determine if this is within scope.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scope Creep Hints for pending/unclassified requests */}
      {isPending && indicators.length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <span className="text-amber-500 mt-0.5">⚠️</span>
            <div>
              <p className="text-sm text-amber-800 font-medium">Potential scope creep detected</p>
              <p className="text-xs text-amber-600 mt-1">
                Found: {indicators.map((ind, i) => (
                  <span key={i}>
                    <span className="font-medium">"{ind}"</span>
                    {i < indicators.length - 1 && ', '}
                  </span>
                ))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* In Scope Match */}
      {isInScope && request.linked_scope_item_id && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="text-sm text-green-700">
              Matches Scope Item: <span className="font-medium">
                {request.linked_scope_item_title || request.linked_scope_item_id}
              </span>
            </span>
          </div>
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
              <DollarSign className="w-4 h-4 mr-1" />
              Create Proposal
              {suggestedAmount && (
                <span className="ml-1 opacity-90">• ${suggestedAmount.toLocaleString()}</span>
              )}
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
        ) : isClarificationNeeded ? (
          <>
            {onMarkOutOfScope && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkOutOfScope}
                isLoading={isMarkingOutOfScope}
                disabled={isActionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                Flag Out of Scope
              </Button>
            )}
            {onMarkInScope && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkInScope}
                isLoading={isMarkingInScope}
                disabled={isActionLoading}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark In Scope
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAddressed}
              isLoading={isAddressing}
              disabled={isActionLoading}
            >
              Mark Addressed
            </Button>
          </>
        ) : (
          // Pending/unclassified - show classification buttons
          <>
            {onMarkOutOfScope && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkOutOfScope}
                isLoading={isMarkingOutOfScope}
                disabled={isActionLoading}
                className="bg-red-600 hover:bg-red-700"
              >
                Flag Out of Scope
              </Button>
            )}
            {onMarkInScope && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkInScope}
                isLoading={isMarkingInScope}
                disabled={isActionLoading}
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Mark In Scope
              </Button>
            )}
            {onMarkClarificationNeeded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkClarificationNeeded}
                isLoading={isMarkingClarification}
                disabled={isActionLoading}
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Needs Clarification
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default RequestCard;
