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
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white pt-32 pb-20 md:pt-40 md:pb-32">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Stop Scope Creep.
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  {' '}Protect Your Revenue.
                </span>
              </h1>

              <p className="text-xl text-slate-300 mb-8 max-w-lg">
                ScopeGuard helps freelancers track project scope, identify out-of-scope requests, 
                and generate professional proposals — all in one place.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/register')}
                  className="bg-white text-indigo-600 hover:bg-indigo-50"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>

              <p className="text-sm text-slate-400 mt-4">
                No credit card required • Free plan available forever
              </p>
            </div>

            {/* Right: Dashboard Preview */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-2xl opacity-20" />
              
              {/* Mockup Container */}
              <div className="relative bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 border-b border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 max-w-xs">
                      app.scopeguard.com/dashboard
                    </div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-4 bg-slate-50">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="h-6 w-48 bg-slate-300 rounded mb-2" />
                      <div className="h-4 w-32 bg-slate-200 rounded" />
                    </div>
                    <div className="h-8 w-24 bg-indigo-500 rounded-lg" />
                  </div>
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                      <div className="h-6 w-12 bg-emerald-500 rounded" />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                      <div className="h-6 w-8 bg-indigo-500 rounded" />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                      <div className="h-6 w-10 bg-amber-500 rounded" />
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="h-3 w-16 bg-slate-200 rounded mb-2" />
                      <div className="h-6 w-14 bg-purple-500 rounded" />
                    </div>
                  </div>
                  
                  {/* Content Area */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 bg-white rounded-lg p-3 border border-slate-200">
                      <div className="h-4 w-24 bg-slate-300 rounded mb-3" />
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <div className="h-3 flex-1 bg-slate-100 rounded" />
                          <div className="h-3 w-8 bg-slate-200 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <div className="h-3 flex-1 bg-slate-100 rounded" />
                          <div className="h-3 w-8 bg-slate-200 rounded" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-500" />
                          <div className="h-3 flex-1 bg-slate-100 rounded" />
                          <div className="h-3 w-8 bg-slate-200 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="h-4 w-20 bg-slate-300 rounded mb-3" />
                      <div className="h-24 bg-gradient-to-t from-indigo-100 to-transparent rounded" />
                    </div>
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
                <div className="relative bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-indigo-600" />
                      </div>
                      <span className="font-semibold text-slate-900">Client Requests</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                        3 Out of Scope
                      </span>
                    </div>
                  </div>
                  
                  {/* Request Items */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">Add user authentication system</p>
                        <p className="text-xs text-slate-500 mt-1">Not in original scope • Est. 8 hours</p>
                      </div>
                      <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg shrink-0">
                        Create Proposal
                      </button>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">Update homepage hero section</p>
                        <p className="text-xs text-slate-500 mt-1">In scope • Marked complete</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full shrink-0">
                        Done
                      </span>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">Build mobile app version</p>
                        <p className="text-xs text-slate-500 mt-1">Not in original scope • Est. 40 hours</p>
                      </div>
                      <button className="px-3 py-1 bg-indigo-600 text-white text-xs font-medium rounded-lg shrink-0">
                        Create Proposal
                      </button>
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
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
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
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Real-time project status
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Revenue protection tracking
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Scope creep alerts
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg" />
                    <div className="h-4 w-32 bg-slate-200 rounded" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-emerald-600">$4,200</div>
                      <div className="text-xs text-slate-500">Revenue Protected</div>
                    </div>
                    <div className="bg-indigo-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-indigo-600">12</div>
                      <div className="text-xs text-slate-500">Active Projects</div>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-amber-600">5</div>
                      <div className="text-xs text-slate-500">Scope Alerts</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-purple-600">89%</div>
                      <div className="text-xs text-slate-500">Proposal Rate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Scope Tracking (reversed) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <span className="font-semibold text-slate-900">Project Scope</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { name: 'Homepage Design', status: 'complete', hours: 8 },
                    { name: 'About Page', status: 'complete', hours: 4 },
                    { name: 'Contact Form', status: 'in-progress', hours: 3 },
                    { name: 'Blog Integration', status: 'pending', hours: 12 },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        item.status === 'complete' ? 'bg-emerald-100' :
                        item.status === 'in-progress' ? 'bg-indigo-100' : 'bg-slate-100'
                      }`}>
                        {item.status === 'complete' && <Check className="w-3 h-3 text-emerald-600" />}
                      </div>
                      <span className="flex-1 text-sm text-slate-700">{item.name}</span>
                      <span className="text-xs text-slate-400">{item.hours}h</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Progress</span>
                    <span className="font-medium text-slate-900">45%</span>
                  </div>
                  <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-[45%] bg-indigo-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
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
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Deliverable checklists
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Hour estimates
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Progress tracking
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 3: Request Management */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
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
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Quick request logging
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  In-scope vs out-of-scope classification
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Full audit trail
                </li>
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-200 to-orange-200 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Recent Requests</span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    2 Need Review
                  </span>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { text: 'Add dark mode toggle', type: 'out', time: '2h ago' },
                    { text: 'Fix mobile nav bug', type: 'in', time: '5h ago' },
                    { text: 'New payment gateway', type: 'out', time: '1d ago' },
                  ].map((req, i) => (
                    <div key={i} className="px-4 py-3 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        req.type === 'out' ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                      <span className="flex-1 text-sm text-slate-700">{req.text}</span>
                      <span className="text-xs text-slate-400">{req.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Proposals (Pro) */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-200 to-pink-200 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">Change Order Proposal</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    Draft
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="text-xs text-slate-500 mb-1">Requested Work</div>
                    <div className="text-sm font-medium text-slate-900">User Authentication System</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Estimated Hours</div>
                      <div className="text-lg font-bold text-slate-900">8 hours</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Proposed Cost</div>
                      <div className="text-lg font-bold text-emerald-600">$800</div>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg">
                    Send to Client
                  </button>
                </div>
              </div>
              {/* Pro badge overlay */}
              <div className="absolute top-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                PRO
              </div>
            </div>
            <div className="order-1 lg:order-2">
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
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Auto-generated proposals
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Professional templates
                </li>
                <li className="flex items-center gap-2 text-slate-700">
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
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-200 p-8 relative">
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
