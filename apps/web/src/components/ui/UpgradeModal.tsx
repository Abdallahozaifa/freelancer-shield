import { Crown, Check, X, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';
import { useUpgrade } from '../../hooks/useBilling';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  limitType: 'projects' | 'clients';
  current: number;
  max: number;
}

export function UpgradeModal({ isOpen, onClose, limitType, current, max }: UpgradeModalProps) {
  const { upgrade, isUpgrading } = useUpgrade();

  const limitMessages = {
    projects: {
      title: "You've reached your project limit",
      description: `You have ${current} of ${max} projects on the Free plan. Upgrade to Pro for unlimited projects.`,
    },
    clients: {
      title: "You've reached your client limit",
      description: `You have ${current} of ${max} clients on the Free plan. Upgrade to Pro for unlimited clients.`,
    },
  };

  const message = limitMessages[limitType];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <h2 className="text-xl font-bold text-slate-900 mb-2">{message.title}</h2>
        <p className="text-slate-600 mb-6">{message.description}</p>

        {/* Pro Features */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Pro includes:</h3>
          <ul className="space-y-2">
            {[
              'Unlimited projects',
              'Unlimited clients',
              'AI scope analysis',
              'Proposal generator',
              'Priority support',
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                <Check className="w-4 h-4 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <span className="text-4xl font-bold text-slate-900">$19</span>
          <span className="text-slate-500">/month</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Maybe Later
          </Button>
          <Button onClick={() => upgrade()} disabled={isUpgrading} className="flex-1">
            {isUpgrading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default UpgradeModal;
