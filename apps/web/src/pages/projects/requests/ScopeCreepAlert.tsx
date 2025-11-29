import React from 'react';
import { AlertOctagon, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '../../../components/ui';
import { cn } from '../../../utils/cn';

interface ScopeCreepAlertProps {
  indicators: string[];
  suggestedAmount?: number;
  onCreateProposal: () => void;
  className?: string;
}

// Common scope creep phrases and their explanations
const indicatorExplanations: Record<string, string> = {
  also: 'adding additional work',
  "shouldn't take long": 'minimizing effort',
  'quick addition': 'scope expansion',
  'just a small': 'downplaying complexity',
  'while you\'re at it': 'bundling extra work',
  'one more thing': 'incremental additions',
  'can you also': 'scope addition',
  'easy change': 'underestimating effort',
  'simple update': 'complexity downplay',
  'real quick': 'time minimization',
  'shouldn\'t be hard': 'difficulty dismissal',
  'just wondering': 'casual scope addition',
  btw: 'informal scope creep',
  'by the way': 'informal scope creep',
  additionally: 'formal scope addition',
  'as well': 'scope bundling',
};

const getIndicatorExplanation = (indicator: string): string => {
  const lowerIndicator = indicator.toLowerCase();
  for (const [key, explanation] of Object.entries(indicatorExplanations)) {
    if (lowerIndicator.includes(key.toLowerCase())) {
      return explanation;
    }
  }
  return 'potential scope expansion';
};

export const ScopeCreepAlert: React.FC<ScopeCreepAlertProps> = ({
  indicators,
  suggestedAmount,
  onCreateProposal,
  className,
}) => {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border-2 border-red-300 bg-gradient-to-r from-red-50 to-orange-50',
        className
      )}
    >
      {/* Alert Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-red-100 border-b border-red-200">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-200">
          <AlertOctagon className="w-5 h-5 text-red-700" />
        </div>
        <div>
          <h4 className="font-bold text-red-800 text-lg">SCOPE CREEP DETECTED</h4>
        </div>
      </div>

      {/* Alert Body */}
      <div className="p-4 space-y-4">
        <p className="text-gray-700">
          This request contains work outside your original project scope.{' '}
          <span className="font-semibold text-red-700">
            Protect your earnings by creating a proposal for this additional work.
          </span>
        </p>

        {/* Detected Indicators */}
        {indicators.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Detected indicators:</p>
            <ul className="space-y-1">
              {indicators.map((indicator, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>
                    <span className="font-mono bg-red-100 text-red-800 px-1.5 py-0.5 rounded text-xs">
                      "{indicator}"
                    </span>
                    <span className="text-gray-500 ml-2">
                      — {getIndicatorExplanation(indicator)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Revenue Protection CTA */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={onCreateProposal}
            className="bg-red-600 hover:bg-red-700 focus-visible:ring-red-500"
          >
            <DollarSign className="w-4 h-4 mr-1" />
            {suggestedAmount
              ? `Create $${suggestedAmount.toLocaleString()} Proposal`
              : 'Create Proposal'}
          </Button>
          
          {suggestedAmount && (
            <div className="flex items-center gap-1.5 text-sm text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span>Protect your revenue</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScopeCreepAlert;
