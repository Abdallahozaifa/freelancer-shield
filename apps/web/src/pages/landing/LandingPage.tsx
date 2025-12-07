import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function LandingPage() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white transition-transform group-hover:scale-110">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-slate-900 tracking-tight">ScopeGuard</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">FAQ</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-indigo-600">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-4 flex flex-col gap-4 shadow-xl">
            <a href="#features" className="text-sm font-medium text-slate-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
            <hr className="border-slate-100" />
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start">Sign in</Button>
            </Link>
            <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full">Get Started</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pt-24 pb-16 sm:pt-32 sm:pb-20 md:pt-40 md:pb-24 lg:pt-40 lg:pb-32">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

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

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto bg-white text-indigo-600 hover:bg-indigo-50"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <p className="text-sm text-slate-400 mt-4 text-center lg:text-left">
                No credit card required • Free plan available forever
              </p>
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
                  
                  {/* Stats Grid - Responsive */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-5">
                    {/* Revenue Protected */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide leading-tight">Revenue</span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">$4,280</p>
                      <p className="text-[10px] sm:text-xs text-emerald-600 mt-0.5 sm:mt-1">↑ 12% this month</p>
                    </div>
                    
                    {/* Active Projects */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide leading-tight">Projects</span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                          <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">8</p>
                      <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">3 due this week</p>
                    </div>
                    
                    {/* Scope Creep Alerts */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide leading-tight">Alerts</span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">5</p>
                      <p className="text-[10px] sm:text-xs text-amber-600 mt-0.5 sm:mt-1">Needs review</p>
                    </div>
                    
                    {/* Acceptance Rate */}
                    <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 lg:p-4 border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between mb-1 sm:mb-2">
                        <span className="text-[10px] sm:text-xs font-medium text-slate-500 uppercase tracking-wide leading-tight">Accepted</span>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                        </div>
                      </div>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">89%</p>
                      <p className="text-[10px] sm:text-xs text-purple-600 mt-0.5 sm:mt-1">8 of 9</p>
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
            <div className="sm:hidden mt-8">
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


      {/* 3. Problem/Solution Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          {/* Solution */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 md:p-12 border border-indigo-100">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">
                  ScopeGuard Makes It Easy
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span className="text-slate-700">Log every client request in seconds</span>
                  </li>
                  <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <span className="text-slate-700">Identify out-of-scope work instantly</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                    <span className="text-slate-700">Generate professional change order proposals</span>
                  </li>
                  <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <span className="text-slate-700">Track your protected revenue over time</span>
                  </li>
                </ul>
              </div>
              <div>
                {/* Scope Detection Mockup */}
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
      </section>

      {/* 4. Features Section */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Protect Your Projects
            </h2>
            <p className="text-xl text-slate-600">
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

      {/* 5. Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8 hover:border-slate-300 transition-colors">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Free</h3>
              <p className="text-slate-500 mb-6">For freelancers just starting out</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500">/month</span>
              </div>

              <Button 
                variant="outline" 
                className="w-full mb-8"
                onClick={() => navigate('/register')}
              >
                Get Started Free
              </Button>

              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400" />
                  Up to 3 active projects
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400" />
                  Up to 2 clients
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400" />
                  Basic scope tracking
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400" />
                  Request logging
                </li>
                <li className="flex items-center gap-3 text-slate-600">
                  <Check className="w-5 h-5 text-slate-400" />
                  Email support
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl border-2 border-indigo-200 p-5 sm:p-6 lg:p-8 relative">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-4 py-1 rounded-full">
                RECOMMENDED
              </div>

              <h3 className="text-xl font-bold text-indigo-900 mb-2">Pro</h3>
              <p className="text-indigo-600 mb-6">For growing freelancers</p>

              <div className="mb-2">
                <span className="text-lg text-slate-400 line-through mr-2">$39</span>
                <span className="text-4xl font-bold text-indigo-900">$29</span>
                <span className="text-slate-500">/month</span>
              </div>
              <p className="text-emerald-600 text-sm font-medium mb-6">
                Save $10/month
              </p>

              <Button 
                className="w-full mb-8 bg-indigo-600 hover:bg-indigo-700"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>

              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <Check className="w-5 h-5 text-indigo-600" />
                  Unlimited projects
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <Check className="w-5 h-5 text-indigo-600" />
                  Unlimited clients
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <Check className="w-5 h-5 text-indigo-600" />
                  Smart scope creep detection
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <Check className="w-5 h-5 text-indigo-600" />
                  One-click proposal generator
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <Check className="w-5 h-5 text-indigo-600" />
                  Advanced analytics
                </li>
                <li className="flex items-center gap-3 text-slate-700 font-medium">
                  <Check className="w-5 h-5 text-indigo-600" />
                  Priority support
                </li>
              </ul>
            </div>
          </div>

          {/* Money-back guarantee */}
          <p className="text-center text-slate-500 mt-8">
            <ShieldCheck className="w-5 h-5 inline mr-2" />
            14-day money-back guarantee. No questions asked.
          </p>
        </div>
      </section>

      {/* 5. FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <details className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-slate-900 hover:bg-slate-50">
                What is scope creep?
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600">
                Scope creep happens when clients request work beyond the original project agreement. 
                Small "quick changes" add up, and you end up doing extra work without additional pay.
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-slate-900 hover:bg-slate-50">
                Is there really a free plan?
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600">
                Yes! The free plan is free forever with no credit card required. 
                It includes up to 3 projects and 2 clients. Upgrade to Pro anytime for unlimited access.
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-slate-900 hover:bg-slate-50">
                How does the proposal generator work?
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600">
                When you identify an out-of-scope request, click "Generate Proposal" and we'll create 
                a professional change order document with your pricing that you can send directly to your client.
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-slate-900 hover:bg-slate-50">
                Can I cancel anytime?
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600">
                Absolutely. No contracts, no commitments. Cancel with one click anytime, 
                and you'll keep access until the end of your billing period.
              </div>
            </details>

            <details className="group bg-white rounded-xl border border-slate-200 overflow-hidden">
              <summary className="flex items-center justify-between p-6 cursor-pointer font-medium text-slate-900 hover:bg-slate-50">
                What payment methods do you accept?
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600">
                We accept all major credit cards through Stripe. Your payment information is securely 
                processed and we never store your card details.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* 6. Final CTA Section */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Protect Your Projects?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Stop losing money to scope creep. Start tracking your project scope today.
          </p>
          <Button 
            size="lg" 
            variant="outline"
            className="bg-white text-indigo-600 hover:bg-indigo-50 border-white"
            onClick={() => navigate('/register')}
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-indigo-200 mt-6 text-sm">
            No credit card required • Free plan available forever
          </p>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">ScopeGuard</span>
              </div>
              <p className="text-sm">
                Protect your freelance projects from scope creep.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:support@scopeguard.app" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-sm text-center">
            © {new Date().getFullYear()} ScopeGuard. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
