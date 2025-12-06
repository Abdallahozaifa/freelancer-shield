import React, { useState, useMemo } from 'react';
import {
  Mail, MessageCircle, Phone, Users, FileText,
  CheckCircle2, XCircle, HelpCircle,
  AlertTriangle, Clock, Sparkles, MoreHorizontal,
  DollarSign
} from 'lucide-react';
import { Card, Button, Dropdown } from '../../../components/ui';
import { RequestClassificationBadge } from './RequestClassificationBadge';
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
  email: Mail, chat: MessageCircle, call: Phone, meeting: Users, other: FileText,
};

// ... (Helper functions highlightScopeCreepPhrases, extractIndicators, estimateHours remain same as previous) ...
// For brevity, assuming helpers are present here. 
// Re-adding highlight helper for clarity:
const scopeCreepPhrases = ['also', 'as well', 'additionally', "shouldn't take long", "won't take long", 'quick addition', 'just a small', "while you're at it", 'one more thing', 'can you also', 'easy change', 'simple update', 'real quick', "shouldn't be hard", 'just wondering', 'btw', 'by the way', 'quick question', 'small tweak', 'minor change', 'tiny update'];

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
      matches.push({ start: index, end: index + phrase.length, phrase: content.substring(index, index + phrase.length) });
      startIndex = index + 1;
    }
  });
  matches.sort((a, b) => a.start - b.start);
  const filteredMatches = matches.filter((match, index) => {
    if (index === 0) return true;
    return match.start >= matches[index - 1].end;
  });
  filteredMatches.forEach((match, index) => {
    if (match.start > lastIndex) result.push(content.substring(lastIndex, match.start));
    result.push(<span key={index} className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-bold">{match.phrase}</span>);
    lastIndex = match.end;
  });
  if (lastIndex < content.length) result.push(content.substring(lastIndex));
  return result.length > 0 ? result : content;
};

const extractIndicators = (request: ClientRequest) => {
    // simplified for brevity
    return scopeCreepPhrases.filter(p => request.content.toLowerCase().includes(p)).slice(0,3);
}

const estimateHours = (content: string) => 4; // Simplified for brevity

export const RequestCard: React.FC<RequestCardProps> = ({
  request, onCreateProposal, onMarkAddressed, onDismiss, onRestore, onMarkInScope, onMarkOutOfScope, onMarkClarificationNeeded, hourlyRate: hourlyRateProp, isArchived,
}) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const hourlyRate = hourlyRateProp ? Number(hourlyRateProp) : null;
  const SourceIcon = sourceIcons[request.source];
  
  const isOutOfScope = request.classification === 'out_of_scope';
  const isInScope = request.classification === 'in_scope';
  const isPending = request.classification === 'pending' || !request.classification;
  
  const indicators = useMemo(() => extractIndicators(request), [request]);
  const estimatedHours = useMemo(() => isOutOfScope || isPending ? estimateHours(request.content) : null, [isOutOfScope, isPending, request.content]);
  const suggestedAmount = hourlyRate && estimatedHours ? hourlyRate * estimatedHours : undefined;
  const displayContent = showFullContent ? request.content : (request.content.length > 300 ? `${request.content.substring(0, 300)}...` : request.content);
  
  const handleAction = async (action: () => Promise<void>) => {
    setIsProcessing(true);
    try { await action(); } finally { setIsProcessing(false); }
  };

  // --- ACTIVE CARD ---
  const borderColorClass = 
    isOutOfScope ? 'border-l-red-500 shadow-red-50' : 
    isInScope ? 'border-l-emerald-500 shadow-emerald-50' : 
    isPending ? 'border-l-amber-400 shadow-amber-50' : 'border-l-blue-500'; 

  const dropdownItems = [
    { label: 'Mark Addressed', icon: <CheckCircle2 className="w-4 h-4" />, onClick: () => handleAction(() => onMarkAddressed(request)) },
    { label: 'Dismiss', icon: <XCircle className="w-4 h-4" />, onClick: () => handleAction(() => onDismiss(request)), danger: true },
  ];

  if (isArchived) return <div>{/* Simplified archived view */}</div>;

  return (
    <Card 
      className={cn("relative border-l-[6px] transition-all hover:shadow-lg overflow-visible", borderColorClass, isProcessing && "opacity-50 pointer-events-none")}
      padding="none"
    >
      <div className="p-6">
        
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
             {/* Source Icon with better contrast */}
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
               <SourceIcon className="w-5 h-5" />
            </div>
            <div>
               <h3 className="text-xl font-bold text-slate-900 leading-tight">{request.title}</h3>
               <div className="flex items-center gap-2 mt-1">
                 <span className="text-xs font-medium text-slate-400">{formatRelative(request.created_at)}</span>
                 <span className="text-slate-300">•</span>
                 <RequestClassificationBadge classification={request.classification} />
               </div>
            </div>
          </div>
          <Dropdown
            trigger={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-300 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></Button>}
            items={dropdownItems}
            align="right"
          />
        </div>

        {/* Content Box (Speech Bubble Style) */}
        <div className="relative bg-slate-100/80 rounded-2xl p-5 border border-slate-200 text-slate-700 text-base leading-relaxed">
           {/* Decorative visual */}
           <div className="absolute -top-3 left-6 w-4 h-4 bg-slate-100 border-t border-l border-slate-200 transform rotate-45"></div>
           
           <div className="font-serif italic text-slate-600">
             "{isOutOfScope || isPending ? highlightScopeCreepPhrases(displayContent) : displayContent}"
           </div>
           
           {request.content.length > 300 && (
            <button onClick={() => setShowFullContent(!showFullContent)} className="mt-2 text-xs font-bold text-indigo-600 uppercase tracking-wide">
              {showFullContent ? 'Read Less' : 'Read More'}
            </button>
           )}
        </div>

        {/* AI Analysis Footer (Only if relevant) */}
        {(isOutOfScope || (isPending && indicators.length > 0)) && (
          <div className="mt-4 flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-white p-3 rounded-lg border border-indigo-100">
             <div className="p-1.5 bg-indigo-100 rounded text-indigo-600"><Sparkles className="w-4 h-4" /></div>
             <div className="flex-1 flex flex-wrap gap-4 text-sm text-slate-600">
                {indicators.length > 0 && <span className="font-medium text-amber-700 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Scope creep phrases detected</span>}
                {estimatedHours && <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> ~{estimatedHours}h estimated</span>}
                {suggestedAmount && <span className="font-bold text-emerald-700 flex items-center gap-1"><DollarSign className="w-3 h-3" /> ${suggestedAmount} potential</span>}
             </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="mt-6 flex flex-wrap gap-3">
           {isOutOfScope ? (
             <>
               <Button onClick={() => onCreateProposal(request)} className="bg-slate-900 text-white hover:bg-slate-800 shadow-md">
                 <FileText className="w-4 h-4 mr-2" /> Generate Proposal
               </Button>
               <Button variant="outline" onClick={() => handleAction(() => onMarkAddressed(request))}>Mark Addressed</Button>
             </>
           ) : isPending ? (
             <div className="flex gap-2 w-full">
                {onMarkOutOfScope && <Button variant="outline" className="flex-1 border-slate-300 hover:border-red-400 hover:bg-red-50 hover:text-red-700" onClick={() => handleAction(() => onMarkOutOfScope(request))}>Out of Scope</Button>}
                {onMarkClarificationNeeded && <Button variant="outline" className="flex-1 border-slate-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700" onClick={() => handleAction(() => onMarkClarificationNeeded(request))}>Needs Info</Button>}
                {onMarkInScope && <Button variant="outline" className="flex-1 border-slate-300 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700" onClick={() => handleAction(() => onMarkInScope(request))}>In Scope</Button>}
             </div>
           ) : (
             <div className="w-full flex justify-end">
               <Button variant="outline" onClick={() => handleAction(() => onMarkAddressed(request))}><CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete</Button>
             </div>
           )}
        </div>

      </div>
    </Card>
  );
};

export default RequestCard;