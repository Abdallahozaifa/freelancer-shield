import React, { useState, useMemo } from 'react';
import {
  Mail, MessageCircle, Phone, Users, FileText,
  CheckCircle2, XCircle, MoreHorizontal,
  Clock, Sparkles, DollarSign, ChevronDown, ChevronUp
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
  onCreateProposal: () => void;
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
  request, onCreateProposal, actions, hourlyRate: hourlyRateProp
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const hourlyRate = hourlyRateProp ? Number(hourlyRateProp) : null;
  const SourceIcon = sourceIcons[request.source];
  
  const isOutOfScope = request.classification === 'out_of_scope';
  const isInScope = request.classification === 'in_scope';
  const isPending = !request.classification || request.classification === 'pending';
  const isClarification = request.classification === 'clarification_needed';
  const isArchived = request.status === 'declined' || request.status === 'archived';
  const isProposalSent = request.status === 'proposal_sent';

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
      {/* --- Main Row Layout (12 Cols) --- */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center">
        
        {/* Col 1-5: Title & Snippet */}
        <div className="col-span-12 md:col-span-5 flex flex-col justify-center overflow-hidden">
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
        <div className="col-span-2 hidden md:flex items-center gap-2 text-slate-500">
          <SourceIcon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium capitalize">{request.source}</span>
        </div>

        {/* Col 8-9: Status Badge */}
        <div className="col-span-3 md:col-span-2 hidden md:flex items-center">
          <StatusBadge 
            status={request.status} 
            classification={request.classification} 
            isProposalSent={isProposalSent} 
          />
        </div>

        {/* Col 10-11: Timestamp (Aligned Right) */}
        <div className="col-span-2 hidden md:flex justify-end">
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {formatRelative(request.created_at)}
          </span>
        </div>

        {/* Col 12: Actions (Align End) */}
        <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-1">
          {/* Hover Actions */}
          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity mr-2">
             {!isArchived && (
               <Dropdown
                 trigger={
                   <Button size="xs" variant="ghost" className="h-7 w-7 p-0 hover:bg-slate-200 rounded-md">
                     <MoreHorizontal className="w-4 h-4 text-slate-500" />
                   </Button>
                 }
                 items={[
                   { label: 'Mark Processed', icon: <CheckCircle2 className="w-4 h-4" />, onClick: () => handleAction(() => actions.markAddressed(request)) },
                   { label: 'Archive/Dismiss', icon: <XCircle className="w-4 h-4" />, onClick: () => handleAction(() => actions.dismiss(request)), danger: true }
                 ]}
                 align="right"
               />
             )}
          </div>
          <div className="text-slate-300">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* --- Expanded Detail View --- */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 md:pl-6 cursor-default border-t border-slate-100/50" onClick={(ev) => ev.stopPropagation()}>
          <div className="flex flex-col gap-4">
            
            {/* Full Content */}
            <div className="prose prose-sm max-w-none text-slate-700 bg-white p-4 rounded-lg border border-slate-200">
              <p className="whitespace-pre-wrap leading-relaxed">{request.content}</p>
            </div>

            {/* Analysis & Actions Row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Left: Analysis (If applicable) */}
              {(isOutOfScope || isPending) ? (
                <div className="flex items-center gap-3 text-xs bg-slate-100/50 px-3 py-2 rounded-md border border-slate-100">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Sparkles className="w-3 h-3 text-indigo-500" /> Analysis:
                  </span>
                  {estimatedHours && <span>~{estimatedHours}h effort</span>}
                  {suggestedAmount && <span className="font-semibold text-emerald-700">Potential ${suggestedAmount}</span>}
                </div>
              ) : (
                <div /> /* Spacer */
              )}

              {/* Right: Primary Actions */}
              <div className="flex items-center gap-2">
                {!isArchived && !isProposalSent && (
                  <>
                    <div className="flex rounded-md shadow-sm" role="group">
                      <button
                        onClick={e(() => handleAction(() => actions.classifyOut(request)))}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium border rounded-l-md transition-colors",
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
                          "px-3 py-1.5 text-xs font-medium border-t border-b border-r transition-colors",
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
                          "px-3 py-1.5 text-xs font-medium border-t border-b border-r rounded-r-md transition-colors",
                          isInScope 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        In Scope
                      </button>
                    </div>
                  </>
                )}

                {isOutOfScope && !isProposalSent && (
                  <Button 
                    size="sm" 
                    className="ml-2 bg-slate-900 text-white hover:bg-slate-800 h-8"
                    onClick={e(onCreateProposal)}
                  >
                    Generate Proposal
                  </Button>
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
const StatusBadge = ({ status, classification, isProposalSent }: any) => {
  if (isProposalSent) {
    return <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-200">Proposal Sent</Badge>;
  }
  if (status === 'addressed' || classification === 'in_scope') {
    return <Badge variant="neutral" size="sm" className="bg-slate-100 text-slate-600 border-slate-200">Processed</Badge>;
  }
  if (classification === 'out_of_scope') {
    return <Badge variant="danger" size="sm" className="bg-red-100 text-red-800 border-red-200 font-medium">Out of Scope</Badge>;
  }
  if (classification === 'clarification_needed') {
    return <Badge variant="info" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">Needs Info</Badge>;
  }
  return <Badge variant="warning" size="sm" className="bg-amber-100 text-amber-800 border-amber-200 font-medium">Pending Review</Badge>;
};

export default RequestCard;