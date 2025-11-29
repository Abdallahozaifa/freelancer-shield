import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Brain,
  Target,
  Lightbulb,
  Link2,
} from 'lucide-react';
import { cn } from '../../../utils/cn';
import type { ScopeClassification } from '../../../types';

interface AnalysisPanelProps {
  classification: ScopeClassification;
  confidence: number | null;
  reasoning: string | null;
  suggestedAction: string | null;
  matchedScopeItemId: string | null;
  matchedScopeItemTitle?: string;
  indicators?: string[];
  defaultExpanded?: boolean;
}

const classificationColors: Record<ScopeClassification, string> = {
  in_scope: 'bg-green-500',
  out_of_scope: 'bg-red-500',
  clarification_needed: 'bg-yellow-500',
  revision: 'bg-blue-500',
  pending: 'bg-gray-400',
};

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  classification,
  confidence,
  reasoning,
  suggestedAction,
  matchedScopeItemId,
  matchedScopeItemTitle,
  indicators = [],
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const confidencePercent = confidence !== null ? Math.round(confidence * 100) : null;

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Brain className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium text-gray-700">AI Analysis</span>
          
          {/* Confidence Bar */}
          {confidencePercent !== null && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', classificationColors[classification])}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">{confidencePercent}%</span>
            </div>
          )}
        </div>
        
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4 bg-gray-50">
          {/* Confidence Breakdown */}
          {confidencePercent !== null && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Confidence Level
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      classificationColors[classification]
                    )}
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-gray-700 min-w-[3rem]">
                  {confidencePercent}%
                </span>
              </div>
            </div>
          )}

          {/* Scope Creep Indicators */}
          {indicators.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5" />
                Scope Creep Indicators
              </h4>
              <div className="flex flex-wrap gap-2">
                {indicators.map((indicator, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded"
                  >
                    "{indicator}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Reasoning */}
          {reasoning && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                Analysis Reasoning
              </h4>
              <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                {reasoning}
              </p>
            </div>
          )}

          {/* Matched Scope Item */}
          {matchedScopeItemId && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                Matched Scope Item
              </h4>
              <div className="flex items-center gap-2 bg-green-50 p-3 rounded border border-green-200">
                <span className="text-sm text-green-700">
                  {matchedScopeItemTitle || `Scope Item: ${matchedScopeItemId}`}
                </span>
              </div>
            </div>
          )}

          {/* Suggested Action */}
          {suggestedAction && (
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5" />
                Suggested Action
              </h4>
              <p className="text-sm text-indigo-700 bg-indigo-50 p-3 rounded border border-indigo-200">
                {suggestedAction}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisPanel;
