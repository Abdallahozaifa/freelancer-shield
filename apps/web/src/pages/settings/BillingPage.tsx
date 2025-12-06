import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  Check, 
  Crown, 
  Zap,
  AlertCircle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  HelpCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge'; // Assuming you have this, or use standard span
import { useSubscription, useUpgrade } from '../../hooks/useBilling';

// Helper component for usage bars
const UsageMetric = ({ label, current, max, icon: Icon }: { label: string, current: number, max: number, icon: any }) => {
  const isUnlimited = max > 900; // Assuming 999 is generic for unlimited
  const percentage = isUnlimited ? 0 : Math.min((current / max) * 100, 100);
  
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
          {isUnlimited ? '∞' : max}
        </div>
      </div>
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            percentage > 90 ? 'bg-amber-500' : 'bg-indigo-600'
          } ${isUnlimited ? 'bg-emerald-500 w-full opacity-20' : ''}`}
          style={{ width: isUnlimited ? '100%' : `${percentage}%` }}
        />
      </div>
    </div>
  );
};

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
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <p className="text-slate-500 font-medium">Loading subscription details...</p>
      </div>
    );
  }

  const isPro = subscription?.is_pro;
  const isCanceled = subscription?.cancel_at_period_end;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Billing & Subscription</h1>
          <p className="text-slate-500 mt-2 text-lg">Manage your plan, payment methods, and usage limits.</p>
        </div>
        {isPro && (
          <Button
            variant="outline"
            onClick={() => openPortal()}
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
                  <p className="text-slate-500 font-medium">
                    {isPro ? '$19.00 / month' : 'Forever free'}
                  </p>
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
                <Button variant="outline" size="sm" onClick={() => openPortal()} className="md:hidden">
                  Manage
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
                    max={subscription?.max_projects || 0} 
                  />
                  <UsageMetric 
                    label="Active Clients" 
                    icon={Check}
                    current={subscription?.current_clients || 0} 
                    max={subscription?.max_clients || 0} 
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
                variant="white" 
                className="mt-8 w-full"
                onClick={() => openPortal()}
              >
                Manage Billing
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
                  <span className="text-3xl font-bold text-slate-900">$19</span>
                  <span className="text-slate-500">/month</span>
                </div>

                <Button 
                  onClick={() => upgrade()} 
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
              <div className="text-2xl font-bold text-indigo-900">$19<span className="text-sm font-medium text-slate-400">/mo</span></div>
            </div>
            <hr className="border-indigo-50 my-6" />
            <ul className="space-y-4">
              {[
                'Unlimited projects',
                'Unlimited clients',
                'Smart scope creep detection',
                'One-click proposal generator',
                'Priority 24/7 support',
                'Client portal access'
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
                  onClick={() => upgrade()} 
                  disabled={isUpgrading}
                  className="w-full py-6 text-base"
                >
                   Upgrade to Pro
                </Button>
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