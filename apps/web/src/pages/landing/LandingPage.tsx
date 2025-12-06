import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  BarChart3,
  ArrowRight,
  Users,
  Layout,
  AlertTriangle,
  Clock,
  DollarSign,
  Zap,
  Lock,
  Menu,
  X,
  Search,
  Bell,
  MoreHorizontal,
  ArrowUpRight,
  FolderKanban,
  Check,
  MessageSquare,
  Plug
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';

export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
              <a href="#features" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">How it Works</a>
              <a href="#pricing" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Pricing</a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-indigo-600">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20">
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
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>How it Works</a>
            <a href="#pricing" className="text-sm font-medium text-slate-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
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

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-[100px]" />
          <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-purple-400/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold uppercase tracking-wide mb-8 animate-fade-in-up">
            <Zap className="w-3 h-3" />
            New: Project Profitability Tracking
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.1] mb-6 tracking-tight max-w-4xl mx-auto">
            Stop losing money to <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animate-gradient-x">
              scope creep.
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The all-in-one tool for freelancers to track deliverables, detect unbilled requests, 
            and generate proposals instantly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-slate-900 hover:bg-slate-800 shadow-xl shadow-indigo-500/20">
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/#how-it-works">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-white">
                How it Works
              </Button>
            </Link>
          </div>

          {/* Product Visualization (High-Fidelity CSS Mockup) */}
          <div className="relative max-w-6xl mx-auto mt-12 perspective-1000 group">
            {/* Main Window */}
            <div className="relative bg-slate-50 rounded-2xl shadow-2xl shadow-indigo-900/10 border border-slate-200/60 overflow-hidden transform rotate-x-6 transition-transform duration-700 hover:rotate-x-0 hover:-translate-y-2 origin-top">
              
              {/* Browser Bar */}
              <div className="h-12 bg-white border-b border-slate-200 flex items-center px-4 justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400/50" />
                </div>
                <div className="flex-1 max-w-md mx-auto h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-xs text-slate-400 font-medium">
                  <Lock className="w-3 h-3 mr-2" /> app.scopeguard.io
                </div>
                <div className="w-16" />
              </div>

              <div className="flex h-[600px] bg-slate-50 text-left">
                {/* Sidebar */}
                <div className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col p-4 border-r border-slate-800">
                  <div className="flex items-center gap-3 mb-8 px-2 mt-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white tracking-tight">ScopeGuard</span>
                  </div>
                  
                  <div className="space-y-1">
                    {[
                      { icon: Layout, label: 'Dashboard', active: true },
                      { icon: FolderKanban, label: 'Projects', active: false },
                      { icon: Users, label: 'Clients', active: false },
                      { icon: FileText, label: 'Proposals', active: false },
                    ].map((item, i) => (
                      <div key={i} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'hover:bg-slate-800 hover:text-white'}`}>
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
                      <div>
                        <p className="text-xs font-medium text-white">Alex Freeman</p>
                        <p className="text-[10px] text-slate-500">Pro Plan</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                  {/* Top Bar */}
                  <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
                    <h2 className="font-bold text-slate-900 text-lg">Dashboard</h2>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <div className="w-64 h-9 bg-slate-50 border border-slate-200 rounded-lg" />
                      </div>
                      <div className="w-px h-6 bg-slate-200" />
                      <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                      </button>
                    </div>
                  </header>

                  <main className="flex-1 p-8 overflow-y-auto">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      {[
                        { label: 'Revenue Protected', value: '$12,450', change: '+12%', icon: DollarSign, color: 'bg-emerald-500' },
                        { label: 'Pending Proposals', value: '3', change: '$4,200', icon: FileText, color: 'bg-amber-500' },
                        { label: 'Active Projects', value: '8', change: '2 new', icon: FolderKanban, color: 'bg-indigo-500' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                              <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                            </div>
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center">
                              <ArrowUpRight className="w-3 h-3 mr-1" /> {stat.change}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Content Columns */}
                    <div className="grid grid-cols-3 gap-8">
                      {/* Project List */}
                      <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                          <h3 className="font-bold text-slate-900">Active Projects</h3>
                          <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {[
                            { name: 'Website Redesign', client: 'Acme Corp', status: 'On Track', progress: 75 },
                            { name: 'Mobile App MVP', client: 'TechStart', status: 'Scope Creep', progress: 45 },
                            { name: 'Brand Identity', client: 'Studio 54', status: 'On Track', progress: 90 },
                            { name: 'Q4 Marketing', client: 'Global Inc', status: 'On Track', progress: 20 },
                          ].map((project, i) => (
                            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                                  {project.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-900 text-sm">{project.name}</p>
                                  <p className="text-xs text-slate-500">{project.client}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="hidden sm:block">
                                  <div className="flex justify-between text-xs mb-1.5">
                                    <span className="font-medium text-slate-700">{project.progress}%</span>
                                  </div>
                                  <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${project.progress}%` }} />
                                  </div>
                                </div>
                                {project.status === 'Scope Creep' ? (
                                  <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
                                    Scope Creep
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
                                    Active
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Alerts Panel */}
                      <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                          <h3 className="font-bold text-slate-900 mb-4">Action Required</h3>
                          <div className="space-y-3">
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100">
                              <div className="flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                                <div>
                                  <p className="text-sm font-bold text-red-900">Scope Creep Detected</p>
                                  <p className="text-xs text-red-700 mt-1">Mobile App MVP has 2 unbilled requests.</p>
                                  <button className="mt-2 text-xs font-semibold text-white bg-red-600 px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors shadow-sm">
                                    Review & Bill
                                  </button>
                                </div>
                              </div>
                            </div>
                            <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-100 flex gap-3 items-center">
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-indigo-900">Proposal Accepted</p>
                                <p className="text-xs text-indigo-600">+$1,200 secured</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Strip */}
      <section className="py-10 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">Trusted by freelancers at</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 grayscale opacity-60">
            {['Acme Corp', 'Global Design', 'TechFlow', 'Studio 44', 'Indie Devs'].map((logo) => (
              <span key={logo} className="text-xl font-bold text-slate-300">{logo}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid (With Visual Diagrams) */}
      <section id="features" className="py-24 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Everything you need to scale</h2>
            <p className="text-slate-600">Stop managing scope in spreadsheets. Use visual tools built for growth.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1: Scope Matching Diagram */}
            <div className="md:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Scope Boundary Protection</h3>
                  <p className="text-slate-500 leading-relaxed">
                    Compare incoming client requests against your agreed deliverables. ScopeGuard highlights requests that don't match your contract, helping you identify billable work instantly.
                  </p>
                </div>
                
                {/* CSS Diagram: Scope Comparison */}
                <div className="w-full md:w-1/2 bg-slate-50 rounded-xl p-4 border border-slate-100 relative">
                  <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                  
                  {/* Left: Contract */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-3">
                    <div className="text-xs font-bold text-slate-400 uppercase mb-2">Agreed Scope</div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <div className="h-2 w-24 bg-slate-100 rounded" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-3 h-3 text-emerald-500" />
                        <div className="h-2 w-32 bg-slate-100 rounded" />
                      </div>
                    </div>
                  </div>

                  {/* Arrow Logic */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <div className="bg-slate-200 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-white">vs</div>
                  </div>

                  {/* Right: New Request */}
                  <div className="bg-white p-3 rounded-lg border border-red-200 shadow-sm mt-3 relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500" />
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-slate-700 mb-1">New Request</div>
                        <div className="text-[10px] text-slate-500">"Add mobile dark mode"</div>
                      </div>
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="mt-2 inline-block bg-red-50 text-red-700 text-[10px] px-2 py-0.5 rounded font-medium border border-red-100">
                      Out of Scope
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Proposal Diagram */}
            <div className="md:row-span-2 bg-slate-900 p-8 rounded-2xl shadow-xl flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]" />
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-6">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Instant Proposals</h3>
                <p className="text-slate-300 leading-relaxed mb-8">
                  Convert out-of-scope requests into professional change orders with one click.
                </p>
                
                {/* CSS Diagram: Proposal Flow */}
                <div className="mt-auto space-y-3">
                  {/* Step 1: Alert */}
                  <div className="flex items-center gap-3 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="h-1 flex-1 bg-white/10 rounded-full" />
                  </div>
                  
                  {/* Step 2: Generation */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/50">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 bg-white/10 rounded px-3 py-2 text-xs text-white">
                      Generating Proposal...
                    </div>
                  </div>

                  {/* Step 3: Profit */}
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-full bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-emerald-100">Sent & Approved</span>
                      </div>
                      <span className="text-sm font-bold text-white">+$450</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Revenue Dashboard</h3>
              <p className="text-slate-500">
                Visualize how much "free work" you've saved. Track pending proposals and accepted change orders in real-time.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layout className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Centralized Requests</h3>
              <p className="text-slate-500">
                Consolidate emails, Slack messages, and meeting notes into a single "Inbox" for your project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Preview */}
      <section className="py-24 px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wide mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Coming Soon
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Connect your ecosystem</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
            We are building direct integrations with major freelance platforms to automatically sync your contracts and communications.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {/* Upwork */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 opacity-75 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-[#14a800] flex items-center justify-center text-white font-bold text-xl">Up</div>
              <span className="font-semibold text-slate-700">Upwork</span>
            </div>
            
            {/* Fiverr */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 opacity-75 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-[#1dbf73] flex items-center justify-center text-white font-bold text-xl">fi</div>
              <span className="font-semibold text-slate-700">Fiverr</span>
            </div>

            {/* Slack */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 opacity-75 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-[#4a154b] flex items-center justify-center text-white font-bold text-xl">#</div>
              <span className="font-semibold text-slate-700">Slack</span>
            </div>

            {/* Trello */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 opacity-75 hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 rounded-full bg-[#0079bf] flex items-center justify-center text-white font-bold text-xl">Tr</div>
              <span className="font-semibold text-slate-700">Trello</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (Flow Diagram) */}
      <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              A simple workflow for complex projects
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Protect your time without damaging client relationships.
            </p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 z-0" />

            {[
              {
                step: '1',
                title: 'Define Scope',
                desc: 'Upload your contract deliverables.',
                icon: FolderKanban,
                color: 'indigo'
              },
              {
                step: '2',
                title: 'Log Requests',
                desc: 'Input client emails or messages.',
                icon: MessageSquare,
                color: 'amber'
              },
              {
                step: '3',
                title: 'Get Paid',
                desc: 'Convert extras into paid proposals.',
                icon: DollarSign,
                color: 'emerald'
              },
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-24 h-24 rounded-2xl bg-white border-4 border-${item.color}-50 shadow-lg flex items-center justify-center mb-6`}>
                  <div className={`w-16 h-16 rounded-xl bg-${item.color}-100 flex items-center justify-center`}>
                    <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-600">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 transition-colors">
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Starter</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-slate-900">$0</span>
                <span className="text-slate-500">/mo</span>
              </div>
              <p className="text-slate-600 mb-8 text-sm">Perfect for freelancers just getting started.</p>
              
              <Link to="/register">
                <Button variant="outline" className="w-full mb-8 h-11 border-slate-200">Get Started Free</Button>
              </Link>

              <ul className="space-y-4">
                {[
                  'Up to 3 Active Projects',
                  'Basic Scope Tracking',
                  '5 Proposals / month',
                  'Email Support'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <CheckCircle2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="relative p-8 rounded-3xl bg-slate-900 text-white shadow-2xl transform md:-translate-y-4">
              <div className="absolute top-0 right-0 p-6">
                <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">$19</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <p className="text-slate-400 mb-8 text-sm">For professionals scaling their business.</p>
              
              <Link to="/register">
                <Button className="w-full mb-8 h-11 bg-white text-slate-900 hover:bg-slate-100 border-none">
                  Start Free Trial
                </Button>
              </Link>

              <ul className="space-y-4">
                {[
                  'Unlimited Projects',
                  'Advanced Scope Analysis',
                  'Unlimited Proposals',
                  'Priority Support',
                  'Client Portal (Coming Soon)',
                  'Custom Branding'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative overflow-hidden bg-indigo-600">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to stop working for free?
          </h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of freelancers who use ScopeGuard to protect their time and increase their revenue by an average of 20%.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="h-14 px-8 bg-white text-indigo-600 hover:bg-indigo-50 border-none text-lg">
                Get Started Now
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-indigo-200">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 text-white">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-slate-900">ScopeGuard</span>
              </div>
              <p className="text-sm text-slate-500">
                Empowering freelancers to build sustainable, profitable businesses by managing scope effectively.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Freelance Guide</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Scope Templates</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/privacy" className="hover:text-indigo-600 transition-colors">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-indigo-600 transition-colors">Terms</Link></li>
                <li><a href="#" className="hover:text-indigo-600 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">© 2025 ScopeGuard Inc. All rights reserved.</p>
            <div className="flex gap-4">
              {/* Social icons would go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;