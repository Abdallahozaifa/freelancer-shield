import React from 'react';
import { Edit, Send, Trash2, DollarSign, Clock, Link as LinkIcon, PartyPopper } from 'lucide-react';
import { Card, Button } from '../../../components/ui';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import { formatCurrency, formatDate, formatRelative, formatHours } from '../../../utils/format';
import { cn } from '../../../utils/cn';
import type { Proposal } from '../../../types';

interface ProposalCardProps {
  proposal: Proposal;
  onEdit: (proposal: Proposal) => void;
  onSend: (proposal: Proposal) => void;
  onDelete: (proposal: Proposal) => void;
  onMarkAccepted: (proposal: Proposal) => void;
  onMarkDeclined: (proposal: Proposal) => void;
  isArchived?: boolean;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  onEdit,
  onSend,
  onDelete,
  onMarkAccepted,
  onMarkDeclined,
  isArchived,
}) => {
  const isAccepted = proposal.status === 'accepted';
  const isDraft = proposal.status === 'draft';
  const isSent = proposal.status === 'sent';
  const isDeclined = proposal.status === 'declined';
  const isExpired = proposal.status === 'expired';

  return (
    <Card 
      className={cn(
        'p-5 transition-all duration-200',
        isAccepted && 'ring-2 ring-green-200 bg-green-50/30',
        isDeclined && 'opacity-75'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="font-semibold text-gray-900 truncate">{proposal.title}</h3>
          {proposal.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{proposal.description}</p>
          )}
        </div>
        <ProposalStatusBadge status={proposal.status} />
      </div>

      {/* Amount & Hours */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <DollarSign className={cn(
            'w-4 h-4',
            isAccepted ? 'text-green-500' : 'text-gray-400'
          )} />
          <span className={cn(
            'font-bold',
            isAccepted ? 'text-green-600 text-lg' : 'text-gray-900'
          )}>
            {formatCurrency(proposal.amount)}
          </span>
        </div>
        {proposal.estimated_hours && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Est. {formatHours(proposal.estimated_hours)}</span>
          </div>
        )}
      </div>

      {/* Source Request Link */}
      {proposal.source_request_title && (
        <div className="flex items-start gap-1.5 mb-3 text-sm text-gray-500 bg-gray-50 p-2 rounded">
          <LinkIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            From request: <span className="font-medium text-gray-700">"{proposal.source_request_title}"</span>
          </span>
        </div>
      )}

      {/* Dates */}
      <div className="text-xs text-gray-400 mb-4">
        {isDraft && (
          <span>Created {formatDate(proposal.created_at)}</span>
        )}
        {isSent && proposal.sent_at && (
          <span>Sent {formatDate(proposal.sent_at)} ({formatRelative(proposal.sent_at)})</span>
        )}
        {isAccepted && proposal.responded_at && (
          <span>Accepted {formatDate(proposal.responded_at)}</span>
        )}
        {isDeclined && proposal.responded_at && (
          <span>Declined {formatDate(proposal.responded_at)}</span>
        )}
        {isExpired && proposal.sent_at && (
          <span>Sent {formatDate(proposal.sent_at)} - Expired</span>
        )}
      </div>

      {/* Success Message */}
      {isAccepted && (
        <div className="flex items-center gap-2 text-sm text-green-600 bg-green-100 p-2.5 rounded-lg mb-4">
          <PartyPopper className="w-4 h-4" />
          <span className="font-medium">Revenue protected!</span>
        </div>
      )}

      {/* Actions - only show for active proposals */}
      {!isArchived && (
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          {isDraft && (
            <>
              <Button variant="outline" size="sm" onClick={() => onEdit(proposal)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button variant="primary" size="sm" onClick={() => onSend(proposal)}>
                <Send className="w-4 h-4 mr-1" />
                Send to Client
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(proposal)}
                className="ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}

          {isSent && (
            <>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => onMarkAccepted(proposal)}
                className="bg-green-600 hover:bg-green-700"
              >
                Mark Accepted
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onMarkDeclined(proposal)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Mark Declined
              </Button>
            </>
          )}

          {(isDeclined || isExpired) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(proposal)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
