import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  Check, 
  Crown, 
  Zap,
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';
import { useSubscription, useUpgrade } from '../../hooks/useBilling';

export function BillingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: subscription, isLoading } = useSubscription();
  const { upgrade, isUpgrading, openPortal, isOpeningPortal } = useUpgrade();

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  // Clear URL params after showing message
  useEffect(() => {
    if (success || canceled) {
      const timer = setTimeout(() => {
        setSearchParams({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, canceled, setSearchParams]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const isPro = subscription?.is_pro;
  const isCanceled = subscription?.cancel_at_period_end;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Billing & Subscription</h1>
        <p className="text-slate-500 mt-1">Manage your plan and payment settings</p>
      </div>

      {/* Success/Cancel Messages */}
      {success && (
        <Alert type="success" className="mb-6">
          <Check className="w-5 h-5" />
          <span>Welcome to Pro! Your subscription is now active.</span>
        </Alert>
      )}
      {canceled && (
        <Alert type="warning" className="mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>Checkout was canceled. No charges were made.</span>
        </Alert>
      )}

      {/* Current Plan */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {isPro ? (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-slate-600" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </h2>
                <p className="text-sm text-slate-500">
                  {isPro ? '$19/month' : 'Free forever'}
                </p>
              </div>
            </div>
            {isPro && !isCanceled && (
              <span className="px-3 py-1 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-full">
                Active
              </span>
            )}
            {isCanceled && (
              <span className="px-3 py-1 text-sm font-medium text-amber-700 bg-amber-100 rounded-full">
                Cancels at period end
              </span>
            )}
          </div>

          {/* Usage */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-slate-500 mb-1">Active Projects</div>
              <div className="text-2xl font-bold text-slate-900">
                {subscription?.current_projects} / {subscription?.max_projects === 999 ? '∞' : subscription?.max_projects}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl">
              <div className="text-sm text-slate-500 mb-1">Clients</div>
              <div className="text-2xl font-bold text-slate-900">
                {subscription?.current_clients} / {subscription?.max_clients === 999 ? '∞' : subscription?.max_clients}
              </div>
            </div>
          </div>

          {/* Actions */}
          {isPro ? (
            <Button
              variant="outline"
              onClick={() => openPortal()}
              disabled={isOpeningPortal}
              className="w-full"
            >
              {isOpeningPortal ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Manage Subscription
            </Button>
          ) : (
            <Button
              onClick={() => upgrade()}
              disabled={isUpgrading}
              className="w-full"
            >
              {isUpgrading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Crown className="w-4 h-4 mr-2" />
              )}
              Upgrade to Pro - $19/month
            </Button>
          )}
        </div>
      </Card>

      {/* Plan Comparison */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Plan Comparison</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free Plan */}
            <div className={`p-4 rounded-xl border-2 ${!isPro ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">Free</h4>
                {!isPro && (
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-4">$0<span className="text-sm font-normal text-slate-500">/month</span></div>
              <ul className="space-y-2">
                {[
                  'Up to 3 projects',
                  'Up to 2 clients',
                  'Basic scope tracking',
                  'Request logging',
                  'Email support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Plan */}
            <div className={`p-4 rounded-xl border-2 ${isPro ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-slate-900">Pro</h4>
                {isPro && (
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                    Current
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold text-slate-900 mb-4">$19<span className="text-sm font-normal text-slate-500">/month</span></div>
              <ul className="space-y-2">
                {[
                  'Unlimited projects',
                  'Unlimited clients',
                  'Smart scope detection',
                  'One-click proposal generator',
                  'Priority support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Payment Method (Pro only) */}
      {isPro && (
        <Card className="mt-6">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">Payment Method</h3>
                  <p className="text-sm text-slate-500">Manage your payment details</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openPortal()}
                disabled={isOpeningPortal}
              >
                {isOpeningPortal ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default BillingPage;
