import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, Zap } from 'lucide-react';
import { Button } from './Button';

export interface UpgradePromptProps {
  feature: string;
  description?: string;
  variant?: 'inline' | 'banner' | 'modal' | 'tooltip';
  className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  feature,
  description,
  variant = 'inline',
  className = '',
}) => {
  const navigate = useNavigate();

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white ${className}`}>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <Crown className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Upgrade to Pro</h3>
            <p className="text-indigo-100 text-sm mb-4">
              {description || `${feature} is available on the Pro plan. Unlock unlimited potential!`}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/settings/billing')}
              className="bg-white text-indigo-600 hover:bg-indigo-50 border-white"
            >
              Upgrade Now — $29/month
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 ${className}`}>
        <Lock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-amber-900 font-medium text-sm">{feature} is a Pro feature</p>
          <p className="text-amber-700 text-xs mt-1">
            {description || 'Upgrade to unlock this feature and more.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings/billing')}
            className="mt-3 border-amber-300 text-amber-700 hover:bg-amber-100"
          >
            <Crown className="w-3 h-3 mr-1" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export interface LimitReachedBannerProps {
  type: 'projects' | 'clients';
  current: number;
  max: number;
  className?: string;
}

export const LimitReachedBanner: React.FC<LimitReachedBannerProps> = ({
  type,
  current,
  max,
  className = '',
}) => {
  const navigate = useNavigate();
  const label = type === 'projects' ? 'projects' : 'clients';

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-amber-900">
            {type === 'projects' ? 'Project' : 'Client'} limit reached
          </h4>
          <p className="text-sm text-amber-700 mt-1">
            You've used {current} of {max} {label} on the Free plan.{' '}
            Upgrade to Pro for unlimited {label}.
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/settings/billing')}
            className="mt-3 bg-amber-600 hover:bg-amber-700"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  );
};

export interface ProFeatureBadgeProps {
  className?: string;
}

export const ProFeatureBadge: React.FC<ProFeatureBadgeProps> = ({ className = '' }) => {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full ${className}`}>
      <Crown className="w-3 h-3" />
      Pro
    </span>
  );
};

