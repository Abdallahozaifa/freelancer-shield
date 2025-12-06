import React, { useState } from 'react';
import { 
  FileText, MoreHorizontal, Edit, Send, Trash2, 
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Copy, Eye
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
}

export const ProposalRow: React.FC<ProposalRowProps> = ({
  proposal, onEdit, onSend, onDelete, onAccept, onDecline
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
          <div className="mt-0.5 flex-shrink-0 text-slate-400">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold truncate text-slate-900 block">
              {proposal.title}
            </span>
            <span className="text-xs text-slate-500 truncate mt-0.5 block font-normal">
              {proposal.description || "No description provided"}
            </span>
          </div>
        </div>

        {/* 2. Amount */}
        <div className="col-span-2 hidden md:block text-slate-700 font-medium text-sm">
          {formatCurrency(proposal.amount)}
        </div>

        {/* 3. Status */}
        <div className="col-span-3 md:col-span-2 hidden md:flex items-center">
          <StatusBadge status={proposal.status} />
        </div>

        {/* 4. Created Date */}
        <div className="col-span-2 hidden md:flex justify-end">
          <span className="text-xs text-slate-400 whitespace-nowrap">
            {formatRelative(proposal.created_at)}
          </span>
        </div>

        {/* 5. Actions */}
        <div className="col-span-12 md:col-span-1 flex items-center justify-end gap-1">
          <div className="text-slate-300">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* --- Expanded Details --- */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 md:pl-6 cursor-default border-t border-slate-100/50" onClick={(ev) => ev.stopPropagation()}>
          <div className="flex flex-col gap-4">
            
            {/* Full Content */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Proposal Details</h4>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {proposal.description}
              </p>
              
              {/* Optional: Linked Request or Hours info could go here if available in type */}
              <div className="mt-4 flex gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <span>Last Updated: {formatRelative(proposal.updated_at)}</span>
                {proposal.sent_at && <span>Sent: {formatRelative(proposal.sent_at)}</span>}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex gap-2">
                {/* State Actions */}
                {isDraft && (
                  <Button size="sm" onClick={e(onSend)} leftIcon={<Send className="w-4 h-4" />}>
                    Send to Client
                  </Button>
                )}
                {isSent && (
                  <>
                    <Button size="sm" variant="outline" onClick={e(onAccept)} className="text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Mark Accepted
                    </Button>
                    <Button size="sm" variant="outline" onClick={e(onDecline)} className="text-red-700 border-red-200 hover:bg-red-50">
                      <XCircle className="w-4 h-4 mr-2" /> Mark Declined
                    </Button>
                  </>
                )}
                {isAccepted && (
                  <span className="text-sm text-emerald-600 font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Client accepted this proposal
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={e(onEdit)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit
                </Button>
                
                <Dropdown
                  trigger={<Button size="sm" variant="ghost" className="px-2"><MoreHorizontal className="w-4 h-4" /></Button>}
                  items={[
                    { label: 'Duplicate', icon: <Copy className="w-4 h-4" />, onClick: () => console.log('Dup') },
                    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: onDelete, danger: true }
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

// Status Badge
const StatusBadge = ({ status }: { status: ProposalStatus }) => {
  switch (status) {
    case 'draft': return <Badge variant="neutral" size="sm" className="bg-slate-100 text-slate-600">Draft</Badge>;
    case 'sent': return <Badge variant="info" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">Sent</Badge>;
    case 'accepted': return <Badge variant="success" size="sm" className="bg-emerald-100 text-emerald-700 border-emerald-200">Accepted</Badge>;
    case 'declined': return <Badge variant="danger" size="sm" className="bg-red-50 text-red-700 border-red-200">Declined</Badge>;
    default: return <Badge variant="neutral" size="sm">{status}</Badge>;
  }
};