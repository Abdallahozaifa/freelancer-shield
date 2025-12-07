import React, { useState } from 'react';
import { 
  FileText, MoreHorizontal, Edit, Send, Trash2, 
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Copy, Clock
} from 'lucide-react';
import { Button, Dropdown, Badge } from '../../../components/ui';
import { cn } from '../../../utils/cn';
import { formatCurrency, formatRelative } from '../../../utils/format';
import type { Proposal, ProposalStatus } from '../../../types';

interface ProposalRowProps {
  proposal: Proposal;
  onEdit: () => void;
  onSend: () => void;
  onDelete: () => void;
  onAccept: () => void;
  onDecline: () => void;
  onDuplicate: () => void;
}

export const ProposalRow: React.FC<ProposalRowProps> = ({
  proposal, onEdit, onSend, onDelete, onAccept, onDecline, onDuplicate
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isDraft = proposal.status === 'draft';
  const isSent = proposal.status === 'sent';
  const isAccepted = proposal.status === 'accepted';
  const isDeclined = proposal.status === 'declined';

  // Border logic
  const borderClass = 
    isDraft ? 'border-l-slate-300' :
    isSent ? 'border-l-blue-500' :
    isAccepted ? 'border-l-emerald-500' :
    isDeclined ? 'border-l-red-500' : 'border-l-transparent';

  const e = (fn: () => any) => (ev: React.MouseEvent) => {
    ev.stopPropagation();
    fn();
  };

  return (
    <div 
      className={cn(
        "group transition-colors duration-200 cursor-pointer border-l-[3px]",
        isExpanded ? "bg-slate-50 border-l-transparent" : "bg-white hover:bg-slate-50",
        borderClass
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* --- Compact Row --- */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3.5 items-center">
        
        {/* 1. Details */}
        <div className="col-span-12 md:col-span-5 flex items-start gap-3 overflow-hidden">
          <div className={cn(
            "mt-0.5 flex-shrink-0 p-1.5 rounded-md",
            isAccepted ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
          )}>
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className={cn(
              "text-sm font-semibold truncate block",
              isDeclined ? "text-slate-500 line-through" : "text-slate-900"
            )}>
              {proposal.title}
            </span>
            <span className="text-xs text-slate-500 truncate mt-0.5 block font-normal">
              {proposal.description || "No description provided"}
            </span>
          </div>
        </div>

        {/* 2. Amount - Right Aligned */}
        <div className="col-span-2 hidden md:block text-right pr-4 font-mono font-medium text-slate-700 text-sm">
          {formatCurrency(proposal.amount)}
        </div>

        {/* 3. Status */}
        <div className="col-span-3 md:col-span-2 hidden md:flex items-center">
          <StatusBadge status={proposal.status} />
        </div>

        {/* 4. Created Date - Right Aligned */}
        <div className="col-span-2 hidden md:flex justify-end">
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {formatRelative(proposal.created_at)}
          </span>
        </div>

        {/* 5. Actions */}
        <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-1">
          <div className="text-slate-300 group-hover:text-slate-500 transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* --- Expanded Details --- */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 md:pl-12 cursor-default border-t border-slate-100/50" onClick={(ev) => ev.stopPropagation()}>
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            
            {/* Meta Info Row */}
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 pb-3 border-b border-slate-100">
              {/* Only show estimated hours if they exist */}
              {(proposal as any).estimated_hours && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Est. Hours: <span className="font-medium text-slate-700">{(proposal as any).estimated_hours}</span>
                </span>
              )}
              
              {proposal.sent_at && (
                <span className="flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  Sent: {formatRelative(proposal.sent_at)}
                </span>
              )}
              
              {!proposal.sent_at && !(proposal as any).estimated_hours && (
                <span className="italic text-slate-400">No additional metadata</span>
              )}
            </div>

            {/* Description - Fixed wrapping issue */}
            <div className="prose prose-sm max-w-none text-slate-700 w-full break-words">
              <p className="whitespace-pre-wrap leading-relaxed">{proposal.description}</p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex gap-2">
                {/* State Actions */}
                {isDraft && (
                  <Button size="sm" onClick={e(onSend)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                    <Send className="w-3.5 h-3.5 mr-2" /> Send to Client
                  </Button>
                )}
                {isSent && (
                  <>
                    <Button size="sm" variant="outline" onClick={e(onAccept)} className="text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Mark Accepted
                    </Button>
                    <Button size="sm" variant="outline" onClick={e(onDecline)} className="text-red-700 border-red-200 hover:bg-red-50">
                      <XCircle className="w-3.5 h-3.5 mr-2" /> Mark Declined
                    </Button>
                  </>
                )}
                {isAccepted && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4" /> Client accepted this proposal
                  </span>
                )}
                {isDeclined && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-100">
                    <XCircle className="w-4 h-4" /> Client declined this proposal
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                {/* Edit button - show for all except accepted (with warning) */}
                {!isAccepted && (
                  <Button size="sm" variant="outline" onClick={e(onEdit)} className="hover:bg-slate-50">
                    <Edit className="w-3.5 h-3.5 mr-2" /> Edit
                  </Button>
                )}
                
                <Dropdown
                  trigger={
                    <Button size="sm" variant="ghost" className="px-2 hover:bg-slate-100">
                      <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </Button>
                  }
                  items={[
                    { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, onClick: onDuplicate },
                    // Only show delete for draft proposals (backend enforces this)
                    ...(isDraft ? [{ label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, danger: true }] : [])
                  ]}
                  align="right"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// High-Contrast Status Badges
const StatusBadge = ({ status }: { status: ProposalStatus }) => {
  switch (status) {
    case 'draft': 
      return <Badge variant="default" size="sm" className="bg-slate-200 text-slate-700 border-slate-300 font-medium">Draft</Badge>;
    case 'sent': 
      return <Badge variant="info" size="sm" className="bg-blue-100 text-blue-700 border-blue-200 font-medium">Sent</Badge>;
    case 'accepted': 
      return <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-800 border-emerald-200 font-medium">Accepted</Badge>;
    case 'declined': 
      return <Badge variant="danger" size="sm" className="bg-red-100 text-red-800 border-red-200 font-medium">Declined</Badge>;
    default: 
      return <Badge variant="default" size="sm">{status}</Badge>;
  }
};