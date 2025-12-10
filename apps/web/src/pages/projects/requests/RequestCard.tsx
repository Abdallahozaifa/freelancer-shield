import React, { useState, useMemo } from 'react';
import {
  Mail, MessageCircle, Phone, Users, FileText,
  CheckCircle2, XCircle, MoreHorizontal,
  Sparkles, RotateCcw, ChevronDown, ChevronUp, Pencil
} from 'lucide-react';
import { Button, Dropdown, Badge } from '../../../components/ui';
import { cn } from '../../../utils/cn';
import { formatRelative } from '../../../utils/format';
import type { ClientRequest, RequestSource } from '../../../types';

interface RequestActions {
  markAddressed: (r: ClientRequest) => Promise<void>;
  dismiss: (r: ClientRequest) => Promise<void>;
  restore: (r: ClientRequest) => Promise<void>;
  classifyOut: (r: ClientRequest) => Promise<void>;
  classifyIn: (r: ClientRequest) => Promise<void>;
  classifyInfo: (r: ClientRequest) => Promise<void>;
}

interface RequestCardProps {
  request: ClientRequest;
  projectId: string;
  onCreateProposal: () => void;
  onEdit: () => void;
  actions: RequestActions;
  hourlyRate?: number | string | null;
}

const sourceIcons: Record<RequestSource, React.ElementType> = {
  email: Mail, chat: MessageCircle, call: Phone, meeting: Users, other: FileText,
};

// Simplified Helpers
const estimateHours = (content: string) => {
  const wordCount = content.split(/\s+/).length;
  if (wordCount < 20) return 2;
  if (wordCount < 50) return 4;
  return 8;
};

export const RequestCard: React.FC<RequestCardProps> = ({
  request, projectId: _projectId, onCreateProposal, onEdit, actions, hourlyRate: hourlyRateProp
}) => {
  void _projectId; // Keep for interface compatibility
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const hourlyRate = hourlyRateProp ? Number(hourlyRateProp) : null;
  const SourceIcon = sourceIcons[request.source];
  
  const isOutOfScope = request.classification === 'out_of_scope';
  const isInScope = request.classification === 'in_scope';
  const isPending = !request.classification || request.classification === 'pending';
  const isClarification = request.classification === 'clarification_needed';
  const isAddressed = request.status === 'addressed';
  const isDeclined = request.status === 'declined';
  const isProposalSent = request.status === 'proposal_sent';
  const isArchived = isAddressed || isDeclined || isProposalSent; // History tab items
  const isActive = request.status === 'new' || request.status === 'analyzed'; // Active (not in history)

  const estimatedHours = useMemo(() => isOutOfScope || isPending ? estimateHours(request.content) : null, [isOutOfScope, isPending, request.content]);
  const suggestedAmount = hourlyRate && estimatedHours ? hourlyRate * estimatedHours : undefined;

  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true);
    try { await action(); } finally { setIsProcessing(false); }
  };

  const e = (fn: () => any) => (ev: React.MouseEvent) => {
    ev.stopPropagation();
    fn();
  };

  return (
    <div 
      className={cn(
        "group transition-colors duration-200 cursor-pointer border-l-[3px]",
        isExpanded ? "bg-slate-50 border-l-transparent" : "bg-white hover:bg-slate-50",
        isOutOfScope ? "border-l-red-500 hover:bg-red-50/20" : isPending ? "border-l-amber-400" : "border-l-transparent",
        isProcessing && "opacity-50 pointer-events-none"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* --- Desktop Row Layout (12 Cols) - Hidden on mobile --- */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 items-center">
        
        {/* Col 1-5: Title & Snippet */}
        <div className="col-span-5 flex flex-col justify-center overflow-hidden">
          <span className={cn(
            "text-sm font-semibold truncate text-slate-900",
            isArchived && "line-through text-slate-400"
          )}>
            {request.title}
          </span>
          <span className="text-xs text-slate-500 truncate mt-0.5 font-normal">
            {request.content}
          </span>
        </div>

        {/* Col 6-7: Source */}
        <div className="col-span-2 flex items-center gap-2 text-slate-500">
          <SourceIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium capitalize">{request.source}</span>
        </div>

        {/* Col 8-9: Status Badge */}
        <div className="col-span-2 flex items-center">
          <StatusBadge 
            status={request.status} 
            classification={request.classification} 
            isProposalSent={isProposalSent} 
          />
        </div>

        {/* Col 10-11: Timestamp */}
        <div className="col-span-2 flex justify-end">
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {formatRelative(request.created_at)}
          </span>
        </div>

        {/* Col 12: Actions */}
        <div className="col-span-1 flex items-center justify-end gap-1">
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity mr-2">
            <Dropdown
              trigger={
                <Button size="sm" variant="ghost" className="h-7 w-7 p-0 hover:bg-slate-200 rounded-md">
                  <MoreHorizontal className="w-4 h-4 text-slate-500" />
                </Button>
              }
              items={[
                { label: 'Edit', icon: <Pencil className="w-4 h-4" />, onClick: onEdit },
                ...(!isArchived ? [
                  { label: 'Mark Addressed', icon: <CheckCircle2 className="w-4 h-4" />, onClick: () => handleAction(() => actions.markAddressed(request)) },
                  { label: 'Dismiss', icon: <XCircle className="w-4 h-4" />, onClick: () => handleAction(() => actions.dismiss(request)), danger: true }
                ] : [])
              ]}
              align="right"
            />
          </div>
          <div className="text-slate-300">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* --- Mobile Card Layout --- */}
      <div className="md:hidden p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Left: Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge 
                status={request.status} 
                classification={request.classification} 
                isProposalSent={isProposalSent}
                size="sm"
              />
            </div>
            <h3 className={cn(
              "text-sm font-semibold text-slate-900 line-clamp-1",
              isArchived && "line-through text-slate-400"
            )}>
              {request.title}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
              {request.content}
            </p>
            
            {/* Bottom meta row */}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <SourceIcon className="w-3 h-3" />
                <span className="capitalize">{request.source}</span>
              </span>
              <span>{formatRelative(request.created_at)}</span>
            </div>
          </div>

          {/* Right: Expand icon & actions */}
          <div className="flex items-center gap-1 shrink-0 relative">
            <Dropdown
              trigger={
                <button
                  className="p-2 rounded-md text-slate-400 hover:bg-slate-100 touch-manipulation"
                  onClick={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              }
              items={[
                { label: 'Edit', icon: <Pencil className="w-4 h-4" />, onClick: onEdit },
                ...(!isArchived ? [
                  { label: 'Mark Addressed', icon: <CheckCircle2 className="w-4 h-4" />, onClick: () => handleAction(() => actions.markAddressed(request)) },
                  { label: 'Dismiss', icon: <XCircle className="w-4 h-4" />, onClick: () => handleAction(() => actions.dismiss(request)), danger: true }
                ] : [])
              ]}
              align="right"
            />
            <div className="text-slate-300 p-1">
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </div>
        </div>
      </div>

      {/* --- Expanded Detail View --- */}
      {isExpanded && (
        <div className="px-4 md:px-6 pb-4 md:pb-6 pt-2 cursor-default border-t border-slate-100/50" onClick={(ev) => ev.stopPropagation()}>
          <div className="flex flex-col gap-3 sm:gap-4">
            
            {/* Full Content */}
            <div className="prose prose-sm max-w-none text-slate-700 bg-white p-3 sm:p-4 rounded-lg border border-slate-200">
              <p className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">{request.content}</p>
            </div>

            {/* Analysis & Actions Row */}
            <div className="flex flex-col gap-3 sm:gap-4">
              
              {/* Analysis (If applicable) */}
              {(isOutOfScope || isPending) && (
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs bg-slate-100/50 px-3 py-2 rounded-md border border-slate-100">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Sparkles className="w-3 h-3 text-indigo-500" /> Analysis:
                  </span>
                  {estimatedHours && <span>~{estimatedHours}h effort</span>}
                  {suggestedAmount && <span className="font-semibold text-emerald-700">Potential ${suggestedAmount}</span>}
                </div>
              )}

              {/* Actions - Stack on mobile */}
              <div className="flex flex-wrap items-center gap-2">
                {/* History Tab: Show Restore button only */}
                {isArchived && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={e(() => handleAction(() => actions.restore(request)))}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                    className="flex-1 sm:flex-none justify-center"
                  >
                    Restore
                  </Button>
                )}

                {/* Active Requests */}
                {isActive && !isProposalSent && (
                  <>
                    {/* Triage buttons */}
                    {(isPending || isClarification) && (
                      <div className="flex flex-wrap gap-1 w-full sm:w-auto" role="group">
                        <button
                          onClick={e(() => handleAction(() => actions.classifyOut(request)))}
                          className={cn(
                            "flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs font-medium border rounded-md sm:rounded-l-md sm:rounded-r-none transition-colors",
                            isOutOfScope 
                              ? "bg-red-50 text-red-700 border-red-200" 
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          Out of Scope
                        </button>
                        <button
                          onClick={e(() => handleAction(() => actions.classifyInfo(request)))}
                          className={cn(
                            "flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs font-medium border sm:border-l-0 rounded-md sm:rounded-none transition-colors",
                            isClarification 
                              ? "bg-blue-50 text-blue-700 border-blue-200" 
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          Needs Info
                        </button>
                        <button
                          onClick={e(() => handleAction(() => actions.classifyIn(request)))}
                          className={cn(
                            "flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs font-medium border sm:border-l-0 rounded-md sm:rounded-r-md sm:rounded-l-none transition-colors",
                            isInScope 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          )}
                        >
                          In Scope
                        </button>
                      </div>
                    )}

                    {/* Out of Scope actions */}
                    {isOutOfScope && (
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button 
                          size="sm" 
                          variant="primary"
                          className="flex-1 sm:flex-none justify-center bg-slate-900 text-white hover:bg-slate-800"
                          onClick={e(onCreateProposal)}
                        >
                          Generate Proposal
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={e(() => handleAction(() => actions.markAddressed(request)))}
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          className="flex-1 sm:flex-none justify-center"
                        >
                          <span className="hidden sm:inline">Mark </span>Addressed
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={e(() => handleAction(() => actions.dismiss(request)))}
                          leftIcon={<XCircle className="w-4 h-4" />}
                          className="flex-1 sm:flex-none justify-center"
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}

                    {/* In Scope actions */}
                    {isInScope && (
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={e(() => handleAction(() => actions.markAddressed(request)))}
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                          className="flex-1 sm:flex-none justify-center"
                        >
                          <span className="hidden sm:inline">Mark </span>Addressed
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={e(() => handleAction(() => actions.dismiss(request)))}
                          leftIcon={<XCircle className="w-4 h-4" />}
                          className="flex-1 sm:flex-none justify-center"
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Strict Color-Coded Badges
const StatusBadge = ({ status, classification, isProposalSent, size = 'md' }: any) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs';
  
  if (isProposalSent) {
    return <Badge variant="success" className={`bg-emerald-100 text-emerald-800 border-emerald-200 ${sizeClasses}`}>Proposal Sent</Badge>;
  }
  if (status === 'addressed' || classification === 'in_scope') {
    return <Badge variant="default" className={`bg-slate-100 text-slate-600 border-slate-200 ${sizeClasses}`}>Processed</Badge>;
  }
  if (classification === 'out_of_scope') {
    return <Badge variant="danger" className={`bg-red-100 text-red-800 border-red-200 font-medium ${sizeClasses}`}>Out of Scope</Badge>;
  }
  if (classification === 'clarification_needed') {
    return <Badge variant="info" className={`bg-blue-50 text-blue-700 border-blue-200 ${sizeClasses}`}>Needs Info</Badge>;
  }
  return <Badge variant="warning" className={`bg-amber-100 text-amber-800 border-amber-200 font-medium ${sizeClasses}`}>Pending</Badge>;
};

export default RequestCard;