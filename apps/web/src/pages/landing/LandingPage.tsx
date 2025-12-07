import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  ArrowRight,
  AlertTriangle,
  Clock,
  Menu,
  X,
  Check,
  MessageSquare,
  Target,
  LayoutDashboard,
  TrendingDown,
  ArrowDown,
  ChevronDown,
  Shield,
  DollarSign,
  Crown,
  Loader2,
  LayoutGrid,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { useUpgrade, useSubscription } from '../../hooks/useBilling';

export function LandingPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data: subscription } = useSubscription();
  const { upgrade, isUpgrading } = useUpgrade();

  // Handle scroll for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFreePlanClick = () => {
    navigate('/register');
  };

  const handleProPlanClick = () => {
    if (authLoading) return;

    // Check if already Pro
    if (subscription?.is_pro) {
      navigate('/dashboard');
      return;
    }

    if (isAuthenticated) {
      // User is logged in - go directly to Stripe checkout
      upgrade();
    } else {
      // User not logged in - go to signup with plan parameter
      navigate('/register?plan=pro');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Enhanced Navigation - Transparent on hero, white when scrolled */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white shadow-md border-b border-slate-200' 
          : 'bg-transparent'
      }`}>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            
            {/* Logo - Enhanced */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className={`font-bold text-lg transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>
                ScopeGuard
              </span>
            </Link>

            {/* Desktop Navigation Links - Enhanced */}
            <div className="hidden md:flex items-center gap-1">
              <a 
                href="#features" 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  scrolled 
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  scrolled 
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                Pricing
              </a>
              <a 
                href="#faq" 
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  scrolled 
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                FAQ
              </a>
            </div>

            {/* Desktop Auth Buttons - Enhanced with Pro option */}
            <div className="hidden md:flex items-center gap-3">
              <Link 
                to="/login" 
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign in
              </Link>
              
              {/* Pro Button - Highlighted */}
              <button
                onClick={handleProPlanClick}
                disabled={isUpgrading || authLoading}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  scrolled
                    ? 'text-indigo-600 hover:bg-indigo-50'
                    : 'text-indigo-300 hover:bg-white/10'
                }`}
              >
                {isUpgrading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Crown className="w-4 h-4" />
                    Pro
                    <span className={`text-xs ${scrolled ? 'text-indigo-400' : 'text-indigo-400/70'}`}>
                      $29/mo
                    </span>
                  </>
                )}
              </button>
              
              {/* Primary CTA */}
              <Button 
                onClick={handleFreePlanClick}
                size="sm"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
              >
                Get Started Free
                </Button>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? 'text-slate-600 hover:bg-slate-100' : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t ${
            scrolled 
              ? 'bg-white border-slate-200' 
              : 'bg-slate-900/95 backdrop-blur-md border-slate-700'
          }`}>
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              <a 
                href="#features" 
                className={`block px-4 py-2.5 rounded-lg transition-colors ${
                  scrolled
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className={`block px-4 py-2.5 rounded-lg transition-colors ${
                  scrolled
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#faq" 
                className={`block px-4 py-2.5 rounded-lg transition-colors ${
                  scrolled
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </a>
              
              <hr className={`my-3 ${scrolled ? 'border-slate-200' : 'border-slate-700'}`} />
              
              <Link 
                to="/login" 
                className={`block px-4 py-2.5 rounded-lg transition-colors ${
                  scrolled
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign in
            </Link>
              
              {/* Pro option in mobile menu */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleProPlanClick();
                }}
                disabled={isUpgrading || authLoading}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  scrolled
                    ? 'text-indigo-600 hover:bg-indigo-50'
                    : 'text-indigo-300 hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2">
                  {isUpgrading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Crown className="w-4 h-4" />
                  )}
                  <span className="font-medium">Go Pro</span>
                </span>
                <span className={`text-sm ${scrolled ? 'text-indigo-400' : 'text-indigo-400/70'}`}>
                  $29/mo
                </span>
              </button>
              
              <Button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleFreePlanClick();
                }}
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                Get Started Free
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pt-32 pb-16 sm:pt-36 sm:pb-20 md:pt-40 md:pb-24 lg:pt-40 lg:pb-32">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        {/* Gradient overlay at top for smoother transition from navbar */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-900 to-transparent pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Copy - Always visible, centered on mobile */}
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Stop Scope Creep.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Protect Your Revenue.
            </span>
          </h1>
          
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-lg mx-auto lg:mx-0">
                ScopeGuard helps freelancers track project scope, identify out-of-scope requests, 
                and generate professional proposals — all in one place.
              </p>

              {/* CTA Buttons - Sleek Modern Style */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                {/* Get Started Free - Glass effect */}
                <Button 
                  size="lg" 
                  onClick={handleFreePlanClick}
                  className="w-full sm:w-auto bg-white/90 backdrop-blur-sm text-slate-900 hover:bg-white font-semibold shadow-lg shadow-black/10 border border-white/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
                
                {/* Buy Pro - Solid gradient with icon (MORE PROMINENT) */}
                <Button 
                  size="lg" 
                  onClick={handleProPlanClick}
                  disabled={isUpgrading || authLoading}
                  className="w-full sm:w-auto bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold shadow-lg shadow-purple-500/30 border-0 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isUpgrading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Crown className="w-5 h-5" />
                      Buy Pro
                      <span className="px-2 py-0.5 bg-white/20 rounded text-sm font-semibold">$29/mo</span>
                    </span>
                  )}
                </Button>
              </div>

              {/* Helper text - More visual */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 mt-5 justify-center lg:justify-start">
                <span className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  No credit card required
                </span>
                <span className="flex items-center gap-2 text-sm text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-emerald-400" />
                  </div>
                  14-day money-back guarantee
                </span>
              </div>
              </div>

            {/* Right: Dashboard Preview - Hidden on small mobile, shown on sm+ */}
            <div className="relative hidden sm:block">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-2xl opacity-20" />
              
              <div className="relative bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden transform lg:scale-100 md:scale-95 sm:scale-90 origin-top-right">
                {/* Browser Chrome - NO URL */}
                <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-slate-900 border-b border-slate-700">
                  <div className="flex gap-1 sm:gap-1.5">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                      </div>
                  </div>

                {/* Dashboard Content */}
                <div className="p-3 sm:p-4 lg:p-5 bg-slate-50">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3 sm:mb-4 lg:mb-5">
                      <div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900">Good evening, Sarah</h3>
                      <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Here's what's happening with your projects</p>
                      </div>
                    <button className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-lg">
                      + New Project
                    </button>
                    </div>
                  
                  {/* Stats Grid - Refined Icons */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-5">
                    {/* Revenue Protected */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue</span>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-emerald-100 rounded flex items-center justify-center">
                          <DollarSign className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" strokeWidth={2.5} />
                  </div>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">$4,280</p>
                      <p className="text-[10px] sm:text-xs text-emerald-600 font-medium mt-1">↑ 12% this month</p>
                </div>

                    {/* Active Projects */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</span>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-indigo-100 rounded flex items-center justify-center">
                          <LayoutGrid className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600" strokeWidth={2.5} />
                      </div>
                    </div>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">8</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-1">3 due this week</p>
                    </div>

                    {/* Scope Creep Alerts */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Alerts</span>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-amber-100 rounded flex items-center justify-center">
                          <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600" strokeWidth={2.5} />
                            </div>
                          </div>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">5</p>
                      <p className="text-[10px] sm:text-xs text-amber-600 font-medium mt-1">Needs review</p>
                          </div>
                    
                    {/* Acceptance Rate */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-2.5 sm:p-3 lg:p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Accepted</span>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-100 rounded flex items-center justify-center">
                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-600" strokeWidth={2.5} />
                        </div>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-slate-900">89%</p>
                      <p className="text-[10px] sm:text-xs text-purple-600 font-medium mt-1">8 of 9</p>
                    </div>
                    </div>

                  {/* Bottom Section: Alerts + Quick Stats - Hidden on small screens */}
                  <div className="hidden lg:grid grid-cols-3 gap-4">
                    {/* Alerts Section */}
                      <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                        <h4 className="font-semibold text-slate-900 text-sm">Scope Creep Alerts</h4>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">5 new</span>
                        </div>
                      <div className="divide-y divide-slate-100">
                        <div className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">Website Redesign</p>
                            <p className="text-xs text-slate-500">3 out-of-scope requests</p>
                                </div>
                          <span className="text-xs text-slate-400">2h ago</span>
                                </div>
                        <div className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">Mobile App MVP</p>
                            <p className="text-xs text-slate-500">2 out-of-scope requests</p>
                              </div>
                          <span className="text-xs text-slate-400">5h ago</span>
                                  </div>
                                  </div>
                                </div>
                    
                    {/* Project Health */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <h4 className="font-semibold text-slate-900 text-sm">This Month</h4>
                              </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Proposals Sent</span>
                            <span className="font-medium text-slate-900">12</span>
                            </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-3/4 bg-indigo-500 rounded-full" />
                        </div>
                      </div>
                                <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Accepted</span>
                            <span className="font-medium text-emerald-600">9</span>
                                </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-[75%] bg-emerald-500 rounded-full" />
                              </div>
                              </div>
                              <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-500">Pending</span>
                            <span className="font-medium text-amber-600">3</span>
                              </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full w-1/4 bg-amber-500 rounded-full" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
              </div>
            </div>
            
            {/* Mobile-only simplified stats - Shown on small screens */}
            <div className="sm:hidden mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mx-auto max-w-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-500/20 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-white">$4,280</p>
                    <p className="text-xs text-slate-300">Protected</p>
          </div>
                  <div className="bg-indigo-500/20 rounded-lg p-3 text-center">
                    <p className="text-xl font-bold text-white">89%</p>
                    <p className="text-xs text-slate-300">Accepted</p>
        </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 3. Problem/Solution Section - Enhanced */}
      <section className="py-20 relative overflow-hidden bg-white">
        {/* Subtle background accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-50/50 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Scope Creep is Killing Your Profits
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Small "quick changes" add up. Before you know it, you've done extra work without extra pay.
              ScopeGuard helps you capture every request and turn them into billable work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Problem 1 */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
              <h3 className="font-bold text-slate-900 mb-2">Untracked Requests</h3>
              <p className="text-slate-600">
                Client asks pile up in emails, Slack, and calls. You forget to bill for half of them.
                  </p>
                </div>
                
            {/* Problem 2 */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Lost Revenue</h3>
              <p className="text-slate-600">
                "Quick changes" add up. Before you know it, you've done 30% more work for free.
              </p>
            </div>

            {/* Problem 3 */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-red-600" />
                      </div>
              <h3 className="font-bold text-slate-900 mb-2">Awkward Conversations</h3>
              <p className="text-slate-600">
                Bringing up extra charges feels uncomfortable. So you just... don't.
              </p>
                      </div>
                    </div>

          {/* Arrow down */}
          <div className="flex justify-center my-12">
            <ArrowDown className="w-8 h-8 text-slate-300" />
                  </div>

          {/* Solution Box - Enhanced */}
          <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 border border-indigo-100 relative overflow-hidden">
            {/* Decorative gradient orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-200 rounded-full filter blur-3xl opacity-50" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-200 rounded-full filter blur-3xl opacity-50" />
            
            <div className="relative">
              <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                {/* Text Content */}
                <div className="text-center lg:text-left">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4">
                    ScopeGuard Makes It Easy
                  </h3>
                  {/* Wrapper to center list on mobile */}
                  <div className="flex justify-center lg:justify-start">
                    <ul className="space-y-3 sm:space-y-4 text-left">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-slate-700">Log every client request in seconds</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-slate-700">Identify out-of-scope work instantly</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-slate-700">Generate professional change order proposals</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-slate-700">Track your protected revenue over time</span>
                      </li>
                    </ul>
                  </div>
                  </div>

                {/* Mockup - Responsive */}
              <div className="relative max-w-md mx-auto lg:max-w-none">
                {/* Mobile Simplified Mockup */}
                <div className="block lg:hidden">
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center justify-between">
                      <span className="font-semibold text-slate-900 text-sm">Client Requests</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        3 alerts
                      </span>
                      </div>
                    <div className="divide-y divide-slate-100">
                      <div className="p-3 flex items-center gap-2 sm:gap-3">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0" />
                        <span className="flex-1 text-sm text-slate-700 truncate">Add authentication</span>
                        <button className="px-2 py-1 bg-indigo-600 text-white text-xs rounded whitespace-nowrap">
                          Proposal
                        </button>
                    </div>
                      <div className="p-3 flex items-center gap-2 sm:gap-3">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0" />
                        <span className="flex-1 text-sm text-slate-500 line-through truncate">Update hero</span>
                        <span className="text-xs text-emerald-600 whitespace-nowrap">Done</span>
                    </div>
                      <div className="p-3 flex items-center gap-2 sm:gap-3">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-full shrink-0" />
                        <span className="flex-1 text-sm text-slate-700 truncate">Build mobile app</span>
                        <button className="px-2 py-1 bg-indigo-600 text-white text-xs rounded whitespace-nowrap">
                          Proposal
                        </button>
                  </div>
                </div>
              </div>
            </div>

                {/* Desktop Full Mockup */}
                <div className="hidden lg:block">
                  <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                    {/* Tabs Header */}
                    <div className="border-b border-slate-200">
                      <div className="flex">
                        <button className="px-4 py-3 text-sm font-medium text-indigo-600 border-b-2 border-indigo-600">
                          All Requests
                        </button>
                        <button className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">
                          Out of Scope
                          <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">3</span>
                        </button>
                        <button className="px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-700">
                          In Scope
                        </button>
                </div>
                    </div>
                    
                    {/* Request Items */}
                    <div className="divide-y divide-slate-100">
                      {/* Out of Scope Request */}
                      <div className="p-4 bg-amber-50/50">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                    </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-slate-900">Add user authentication system</h4>
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                Out of Scope
                              </span>
                  </div>
                            <p className="text-sm text-slate-600 mb-2">
                              Client requested OAuth login with Google and GitHub integration.
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>Est. 8 hours</span>
                              <span>•</span>
                              <span>Requested 2 days ago</span>
                    </div>
                          </div>
                          <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shrink-0 hover:bg-indigo-700">
                            Create Proposal
                          </button>
                    </div>
                  </div>

                      {/* In Scope Request - Completed */}
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-slate-900">Update homepage hero section</h4>
                              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                                Completed
                              </span>
                    </div>
                            <p className="text-sm text-slate-600 mb-2">
                              New hero with updated copy and call-to-action buttons.
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>4 hours</span>
                              <span>•</span>
                              <span>Completed yesterday</span>
                  </div>
                </div>
              </div>
            </div>

                      {/* Out of Scope Request */}
                      <div className="p-4 bg-amber-50/50">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-slate-900">Build mobile app version</h4>
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                Out of Scope
                              </span>
            </div>
                            <p className="text-sm text-slate-600 mb-2">
                              Full React Native app with push notifications and offline mode.
                            </p>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span>Est. 40 hours</span>
                              <span>•</span>
                              <span>Requested 5 days ago</span>
            </div>
          </div>
                          <button className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg shrink-0 hover:bg-indigo-700">
                            Create Proposal
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* 4. Features Section - Enhanced Background */}
      <section id="features" className="py-20 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-white" />
        
        {/* Subtle Pattern/Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Decorative Blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Protect Your Projects
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Powerful features designed specifically for freelancers
            </p>
          </div>

          {/* Feature 1: Dashboard */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 lg:mb-20">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Your Command Center
              </h3>
              <p className="text-slate-600 mb-6">
                See all your projects, clients, and scope status at a glance. 
                Track revenue protected, monitor project health, and catch scope creep early.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Real-time project status
                </li>
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Revenue protection tracking
                </li>
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Scope creep alerts
                </li>
              </ul>
            </div>
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">Project Health</h4>
                  <span className="text-xs text-slate-500">Last 30 days</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-emerald-600">$4,280</p>
                      <p className="text-xs text-slate-600">Revenue Protected</p>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <p className="text-2xl font-bold text-indigo-600">89%</p>
                      <p className="text-xs text-slate-600">Proposal Acceptance</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Website Redesign</span>
                      <span className="text-sm font-medium text-emerald-600">75%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-emerald-500 rounded-full" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Mobile App MVP</span>
                      <span className="text-sm font-medium text-indigo-600">45%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-[45%] bg-indigo-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Scope Tracking (reversed) */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 lg:mb-20">
            <div className="order-2 lg:order-1 relative max-w-md mx-auto lg:max-w-none">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">Project Scope</h4>
                  <span className="text-xs text-slate-500">Website Redesign</span>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {[
                      { name: 'Homepage Design', done: true, hours: 8 },
                      { name: 'About Page', done: true, hours: 4 },
                      { name: 'Services Section', done: true, hours: 6 },
                      { name: 'Contact Form', done: false, hours: 3 },
                      { name: 'Blog Integration', done: false, hours: 12 },
            ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          item.done 
                            ? 'bg-emerald-500 border-emerald-500' 
                            : 'border-slate-300'
                        }`}>
                          {item.done && (
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          )}
                  </div>
                        <span className={`flex-1 text-sm ${item.done ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                          {item.name}
                        </span>
                        <span className="text-xs text-slate-400">{item.hours}h</span>
                </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Overall Progress</span>
                      <span className="font-semibold text-slate-900">54%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full w-[54%] bg-indigo-500 rounded-full" />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">18 of 33 hours completed</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-4">
                <Target className="w-4 h-4" />
                Scope Tracking
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Define & Protect Your Scope
              </h3>
              <p className="text-slate-600 mb-6">
                Clearly define project deliverables and track completion. 
                When clients request changes, you'll know exactly what's in scope and what isn't.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Deliverable checklists
                </li>
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Hour estimates
                </li>
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Progress tracking
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Request Management */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 lg:mb-20">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium mb-4">
                <MessageSquare className="w-4 h-4" />
                Request Management
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Capture Every Client Request
              </h3>
              <p className="text-slate-600 mb-6">
                Log requests as they come in. Classify them as in-scope or out-of-scope. 
                Never let a billable request slip through the cracks again.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Quick request logging
                </li>
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  In-scope vs out-of-scope classification
                </li>
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Full audit trail
                </li>
              </ul>
            </div>
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-200 to-orange-200 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">Client Requests</h4>
                  <button className="text-xs text-indigo-600 font-medium">+ Add Request</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { text: 'Add dark mode toggle', type: 'out', time: '2h ago', project: 'Website' },
                    { text: 'Fix mobile navigation bug', type: 'in', time: '5h ago', project: 'Website' },
                    { text: 'New payment gateway', type: 'out', time: '1d ago', project: 'E-commerce' },
                    { text: 'Update footer links', type: 'in', time: '2d ago', project: 'Website' },
                  ].map((req, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3 hover:bg-slate-50">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        req.type === 'out' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{req.text}</p>
                        <p className="text-xs text-slate-500">{req.project}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        req.type === 'out' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {req.type === 'out' ? 'Out' : 'In'}
                      </span>
                      <span className="text-xs text-slate-400">{req.time}</span>
              </div>
            ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Proposals (Pro) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative max-w-md mx-auto lg:max-w-none">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">Change Order Proposal</h4>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    Draft
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Client</label>
                    <p className="text-sm font-medium text-slate-900 mt-1">Acme Corporation</p>
                  </div>
                  <div className="mb-4">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Requested Work</label>
                    <p className="text-sm text-slate-900 mt-1">User Authentication System with OAuth</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <label className="text-xs font-medium text-slate-500">Estimated Hours</label>
                      <p className="text-xl font-bold text-slate-900 mt-1">8 hours</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <label className="text-xs font-medium text-slate-500">Proposed Cost</label>
                      <p className="text-xl font-bold text-emerald-600 mt-1">$800</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
                      Send to Client
                    </button>
                    <button className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-50">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
              {/* Pro badge overlay */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                PRO
              </div>
            </div>
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                <FileText className="w-4 h-4" />
                Proposal Generator
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                One-Click Professional Proposals
              </h3>
              <p className="text-slate-600 mb-6">
                Turn out-of-scope requests into professional change order proposals instantly. 
                Stop leaving money on the table.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Auto-generated proposals
                </li>
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Professional templates
                </li>
                <li className="flex items-center gap-2 text-slate-700 justify-center lg:justify-start">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Track client responses
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pricing Section - Enhanced */}
      <section id="pricing" className="py-20 relative overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50" />
          
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {/* Free Plan Card */}
            <div className="relative bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-200/50 transition-shadow duration-300">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
              <p className="text-slate-500 mb-6">For freelancers just starting out</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500">/month</span>
              </div>

              <Button 
                variant="outline" 
                className="w-full mb-8 border-slate-300 hover:bg-slate-50"
                onClick={handleFreePlanClick}
              >
                Get Started Free
              </Button>

              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400 shrink-0" />
                  Up to 3 active projects
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400 shrink-0" />
                  Up to 2 clients
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400 shrink-0" />
                  Basic scope tracking
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400 shrink-0" />
                  Request logging
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400 shrink-0" />
                  Email support
                </li>
              </ul>
            </div>

            {/* Pro Plan Card - Enhanced with glow */}
            <div className="relative">
              {/* Glow effect behind card */}
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-25" />
              
              {/* Card */}
              <div className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 rounded-2xl border-2 border-indigo-200 p-6 sm:p-8 shadow-xl">
                {/* Recommended badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg">
                    RECOMMENDED
                  </span>
                </div>

                <h3 className="text-xl font-bold text-indigo-900 mb-2 mt-2">Pro</h3>
                <p className="text-indigo-600 mb-6">For growing freelancers</p>

                <div className="mb-2">
                  <span className="text-lg text-slate-400 line-through mr-2">$39</span>
                  <span className="text-4xl font-bold text-indigo-900">$29</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="text-emerald-600 text-sm font-semibold mb-6">Save $10/month</p>

                <Button 
                  className="w-full mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
                  onClick={handleProPlanClick}
                  disabled={isUpgrading || authLoading}
                >
                  {isUpgrading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Get Started'
                  )}
                </Button>

                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    Unlimited projects
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    Unlimited clients
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    Smart scope creep detection
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    One-click proposal generator
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    Advanced analytics
                  </li>
                  <li className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-indigo-600" />
                    </div>
                    Priority support
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Money-back guarantee - Enhanced */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <span className="text-slate-600">14-day money-back guarantee. No questions asked.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section - Enhanced */}
      <section id="faq" className="py-20 relative overflow-hidden">
        {/* Background Layers */}
        <div className="absolute inset-0">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50 to-slate-100" />
          
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-0 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          
          {/* Subtle pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />
        </div>
        
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to know about ScopeGuard
            </p>
          </div>

          {/* FAQ Items - Enhanced styling */}
          <div className="space-y-4">
            <details className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                What is scope creep?
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-slate-600 border-t border-slate-100 pt-4">
                Scope creep happens when clients request work beyond the original project agreement. 
                Small "quick changes" add up, and you end up doing extra work without additional pay.
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                Is there really a free plan?
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-slate-600 border-t border-slate-100 pt-4">
                Yes! The free plan is free forever with no credit card required. 
                It includes up to 3 projects and 2 clients. Upgrade to Pro anytime for unlimited access.
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                How does the proposal generator work?
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-slate-600 border-t border-slate-100 pt-4">
                When you identify an out-of-scope request, click "Generate Proposal" and we'll create 
                a professional change order document with your pricing that you can send directly to your client.
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                Can I cancel anytime?
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-slate-600 border-t border-slate-100 pt-4">
                Absolutely. No contracts, no commitments. Cancel with one click anytime, 
                and you'll keep access until the end of your billing period.
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              <summary className="flex items-center justify-between p-5 sm:p-6 cursor-pointer font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                What payment methods do you accept?
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
              </summary>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-slate-600 border-t border-slate-100 pt-4">
                We accept all major credit cards through Stripe. Your payment information is securely 
                processed and we never store your card details.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* 6. Final CTA Section - Enhanced */}
      <section className="py-20 relative overflow-hidden">
        {/* Rich Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700" />
        
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30" />
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
        
        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Protect Your Projects?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Stop losing money to scope creep. Start tracking your project scope today.
          </p>
          
          {/* CTA Buttons - Enhanced styling */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Get Started Free - Clean white */}
            <Button 
              size="lg" 
              onClick={handleFreePlanClick}
              className="bg-white text-indigo-600 hover:bg-slate-100 font-semibold shadow-xl shadow-black/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-0.5"
            >
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
            
            {/* Buy Pro - Prominent gradient */}
            <Button 
              size="lg" 
              onClick={handleProPlanClick}
              disabled={isUpgrading || authLoading}
              className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 hover:from-amber-400 hover:via-orange-400 hover:to-red-400 text-white font-bold shadow-xl shadow-orange-500/40 hover:shadow-orange-500/60 border-0 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isUpgrading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Buy Pro
                  <span className="px-2 py-0.5 bg-white/20 rounded text-sm font-semibold">$29/mo</span>
                </span>
              )}
            </Button>
          </div>
          
          <p className="text-indigo-200 mt-6 text-sm">
            No credit card required for free plan
          </p>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
            {/* Brand Section - Full width on mobile */}
            <div className="col-span-2 sm:col-span-2 md:col-span-1 mb-4 sm:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white text-lg">ScopeGuard</span>
              </div>
              <p className="text-sm text-slate-400 max-w-xs">
                Protect your freelance projects from scope creep and maximize your revenue.
              </p>
            </div>
            
            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
                Product
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                <li>
                  <a href="#features" className="text-sm hover:text-white transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm hover:text-white transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/login" className="text-sm hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm hover:text-white transition-colors">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
                Support
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                <li>
                  <a href="mailto:support@scopeguard.app" className="text-sm hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-sm hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-white text-sm uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 sm:space-y-3">
                <li>
                  <a href="/privacy" className="text-sm hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-8 border-t border-slate-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500 text-center sm:text-left">
                © {new Date().getFullYear()} ScopeGuard. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
