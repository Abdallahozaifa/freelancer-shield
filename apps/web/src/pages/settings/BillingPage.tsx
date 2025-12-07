import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  CreditCard, 
  Check, 
  Crown, 
  Zap,
  AlertCircle,
  Loader2,
  ShieldCheck,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useSubscription, useUpgrade } from '../../hooks/useBilling';
import { useToast } from '../../components/ui/Toast';
import { cn } from '../../utils/cn';

// Promotional pricing constants
const PRICING = {
  original: 39,
  sale: 29,
  savings: 10,
  savingsPercent: 25,
  displayOriginal: '$39',
  displaySale: '$29',
  displayFull: '$29.00 / month',
};

// Helper component for usage bars
const UsageMetric = ({ label, current, max, icon: Icon, isPro = false }: { label: string, current: number, max: number, icon: any, isPro?: boolean }) => {
  const isUnlimited = isPro || max > 900; // Pro users or max > 900 means unlimited
  // Fix division by zero
  const percentage = isUnlimited || max === 0 ? 0 : Math.min((current / max) * 100, 100);
  
  return (
    <div className="group">
      <div className="flex items-center justify-between text-sm mb-2">
        <div className="flex items-center gap-2 text-slate-700 font-medium">
          <Icon className="w-4 h-4 text-slate-400" />
          {label}
        </div>
        <div className="text-slate-500 tabular-nums">
          <span className="font-semibold text-slate-900">{current}</span>
          <span className="mx-1">/</span>
          {isUnlimited ? (
            <span className="text-emerald-600 font-semibold">∞</span>
          ) : (
            max
          )}
        </div>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`${label}: ${current} of ${isUnlimited ? 'unlimited' : max}`}>
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isUnlimited 
              ? 'bg-emerald-500 w-full opacity-30' 
              : percentage > 90 
                ? 'bg-amber-500' 
                : 'bg-indigo-600'
          }`}
          style={{ width: isUnlimited ? '100%' : `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export function BillingPage() {
  // ========== ALL HOOKS MUST BE HERE - BEFORE ANY CONDITIONAL RETURNS ==========
  
  // Router hooks
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Query client
  const queryClient = useQueryClient();
  
  // Data fetching hooks
  const { data: subscription, isLoading, error, refetch } = useSubscription();
  const { upgrade, isUpgrading, openPortal, isOpeningPortal } = useUpgrade();
  
  // Toast hook
  const toast = useToast();

  // Derived values from search params
  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  // Derived state (not hooks, just variables)
  const isPro = subscription?.is_pro ?? false;
  const isCanceled = subscription?.cancel_at_period_end ?? false;

  // ========== ALL useEffect HOOKS ==========
  
  // Force refetch subscription after successful upgrade
  useEffect(() => {
    if (success) {
      // Force refetch subscription immediately
      refetch();
      // Also invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['planLimits'] });
    }
  }, [success, refetch, queryClient]);

  // Clear URL params after showing message
  useEffect(() => {
    if (success || canceled) {
      const timer = setTimeout(() => {
        setSearchParams({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, canceled, setSearchParams]);

  // Handle upgrade errors
  useEffect(() => {
    if (error) {
      toast.error('Failed to load subscription details. Please try again.');
    }
  }, [error, toast]);


  // ========== NOW EARLY RETURNS ARE SAFE ==========
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Loading subscription details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-slate-900">Failed to load subscription</h2>
        <p className="text-slate-500">Please try refreshing the page or contact support.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const handleUpgrade = async () => {
    try {
      await upgrade();
    } catch (error) {
      toast.error('Failed to start upgrade process. Please try again.');
    }
  };

  const handleOpenPortal = async () => {
    try {
      await openPortal();
    } catch (error) {
      toast.error('Failed to open billing portal. Please try again.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Promotional Banner */}
      {!isPro && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-center py-3 px-4 rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/20">
          🎉 Limited Time: Save {PRICING.savingsPercent}% on Pro — was {PRICING.displayOriginal}, now {PRICING.displaySale}/month!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Billing & Subscription</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your plan, payment methods, and usage limits.</p>
        </div>
        {isPro && (
          <Button
            variant="outline"
            onClick={handleOpenPortal}
            disabled={isOpeningPortal}
            className="hidden md:flex bg-white shadow-sm"
          >
            {isOpeningPortal ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
            Billing Portal
          </Button>
        )}
      </div>

      {/* Notifications */}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-900">Subscription Updated</h3>
            <p className="text-emerald-700 text-sm">Welcome to Pro! Your account has been successfully upgraded.</p>
          </div>
        </div>
      )}
      {canceled && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-900">Process Cancelled</h3>
            <p className="text-amber-700 text-sm">The checkout process was canceled. No charges were made to your card.</p>
          </div>
        </div>
      )}

      {/* Current Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Subscription Status */}
        <Card className="lg:col-span-2 overflow-hidden border-slate-200 shadow-sm">
          <div className="p-6 md:p-8">
            <div className="flex items-start justify-between mb-8">
              <div className="flex gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${isPro ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {isPro ? <Crown className="w-7 h-7" /> : <Zap className="w-7 h-7" />}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {isPro ? 'Pro Plan' : 'Free Plan'}
                  </h2>
                  {isPro ? (
                    <p className="text-slate-500 font-medium">
                      <span className="sr-only">Original price {PRICING.displayOriginal}, now </span>
                      <span className="line-through text-slate-400 mr-2" aria-hidden="true">{PRICING.displayOriginal}</span>
                      <span className="text-emerald-600 font-bold">{PRICING.displayFull}</span>
                    </p>
                  ) : (
                    <p className="text-slate-500 font-medium">Forever free</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {isPro && !isCanceled && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                        Active
                      </span>
                    )}
                    {isCanceled && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        Cancels at period end
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Mobile Only Portal Button */}
              {isPro && (
                <Button variant="outline" size="sm" onClick={handleOpenPortal} disabled={isOpeningPortal} className="md:hidden">
                  {isOpeningPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Manage'}
                </Button>
              )}
            </div>

            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Current Usage</h3>
                <div className="grid gap-6">
                  <UsageMetric 
                    label="Active Projects" 
                    icon={Zap}
                    current={subscription?.current_projects || 0} 
                    max={isPro ? 999 : (subscription?.max_projects || 3)}
                    isPro={isPro}
                  />
                  <UsageMetric 
                    label="Active Clients" 
                    icon={Check}
                    current={subscription?.current_clients || 0} 
                    max={isPro ? 999 : (subscription?.max_clients || 2)}
                    isPro={isPro}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer of Card */}
          <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-4 flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>Payments are securely processed by Stripe.</span>
          </div>
        </Card>

        {/* Right: Upsell / Plan Details */}
        <div className="lg:col-span-1">
          {isPro ? (
            <div className="h-full bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-xl p-6 text-white shadow-xl flex flex-col justify-between">
              <div>
                <Crown className="w-10 h-10 text-indigo-300 mb-4 opacity-50" />
                <h3 className="text-xl font-bold mb-2">You're a Pro!</h3>
                <p className="text-indigo-200 text-sm leading-relaxed mb-6">
                  Thank you for supporting our platform. You have access to all premium features, including unlimited projects and smart scope detection.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-indigo-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Projects
                  </div>
                  <div className="flex items-center gap-2 text-sm text-indigo-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Priority Support
                  </div>
                  <div className="flex items-center gap-2 text-sm text-indigo-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Advanced Analytics
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className={cn("mt-8 w-full bg-white text-slate-900 border-white/20 hover:bg-white/90 hover:border-white/30")}
                onClick={handleOpenPortal}
                disabled={isOpeningPortal}
              >
                {isOpeningPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Manage Billing'}
              </Button>
            </div>
          ) : (
            <div className="h-full bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Crown className="w-32 h-32 rotate-12 text-indigo-600" />
              </div>
              
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full mb-4">
                  RECOMMENDED
                </span>
                <h3 className="text-xl font-bold text-slate-900 mb-1">Upgrade to Pro</h3>
                <p className="text-slate-600 text-sm mb-6">Remove limits and automate your workflow.</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="sr-only">Original price {PRICING.displayOriginal}, now </span>
                    <span className="text-xl text-slate-400 line-through" aria-hidden="true">{PRICING.displayOriginal}</span>
                    <span className="text-3xl font-bold text-slate-900">{PRICING.displaySale}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                    SAVE ${PRICING.savings}/mo
                  </span>
                </div>

                <Button 
                  onClick={handleUpgrade} 
                  disabled={isUpgrading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
                >
                  {isUpgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upgrade Now'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan Comparison Table */}
      <div className="mt-12">
        <h3 className="text-xl font-bold text-slate-900 mb-6 px-1">Compare Plans</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Tier */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 hover:border-slate-300 transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg text-slate-900">Free</h4>
                <p className="text-slate-500 text-sm">For freelancers just starting out</p>
              </div>
              <div className="text-2xl font-bold text-slate-900">$0</div>
            </div>
            <hr className="border-slate-100 my-6" />
            <ul className="space-y-4">
              {[
                'Up to 3 active projects',
                'Up to 2 clients',
                'Basic scope tracking',
                'Manual request logging',
                'Standard email support',
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                  <Check className="w-5 h-5 text-slate-400 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tier */}
          <div className="bg-white rounded-xl border-2 border-indigo-100 p-6 md:p-8 relative shadow-lg shadow-indigo-100/50">
            {!isPro && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm tracking-wide">
                MOST POPULAR
              </div>
            )}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-bold text-lg text-indigo-900">Pro</h4>
                <p className="text-indigo-600/80 text-sm">For growing businesses</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="sr-only">Original price {PRICING.displayOriginal}, now </span>
                <span className="text-lg text-slate-400 line-through" aria-hidden="true">{PRICING.displayOriginal}</span>
                <span className="text-2xl font-bold text-indigo-900">{PRICING.displaySale}</span>
                <span className="text-sm font-medium text-slate-400">/mo</span>
              </div>
            </div>
            <hr className="border-indigo-50 my-6" />
            <ul className="space-y-4">
              {[
                'Unlimited projects',
                'Unlimited clients',
                'Smart scope creep detection',
                'One-click proposal generator',
                'Priority 24/7 support'
              ].map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-700 font-medium">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-100 shrink-0">
                    <Check className="w-3 h-3 text-indigo-600" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
            
            {!isPro && (
              <div className="mt-8">
                <Button 
                  onClick={handleUpgrade} 
                  disabled={isUpgrading}
                  className="w-full py-6 text-base"
                >
                  {isUpgrading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upgrade to Pro'}
                </Button>
              </div>
            )}
            {isPro && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 text-emerald-600 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  Current Plan
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-16 pt-10 border-t border-slate-200">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-slate-400" />
          Frequently Asked Questions
        </h3>
        <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Can I cancel anytime?</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Yes, you can cancel your subscription at any time. You will continue to have access to Pro features until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">What happens if I reach my limit?</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              If you're on the Free plan, you won't be able to create new projects or add clients until you archive old ones or upgrade to Pro.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Is my payment information secure?</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              Absolutely. We use Stripe for payment processing. We do not store any of your credit card details on our servers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Do you offer refunds?</h4>
            <p className="text-slate-500 text-sm leading-relaxed">
              If you're not satisfied with the Pro plan within the first 14 days, contact support for a full refund. No questions asked.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingPage;