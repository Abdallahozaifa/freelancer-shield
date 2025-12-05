import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle,
  FileText,
  BarChart3,
  ArrowRight,
  Users,
  FolderKanban,
  AlertTriangle,
  Clock,
  DollarSign,
  Sparkles,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">ScopeGuard</span>
            </div>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                How it Works
              </a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                Pricing
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started Free</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Stop losing money to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                  scope creep
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 max-w-lg">
                ScopeGuard helps freelancers track client requests, detect out-of-scope work, 
                and generate proposals to protect their revenue.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Free plan available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

            {/* Right - Dashboard Mockup */}
            <div className="relative lg:pl-8">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl" />
              
              {/* Dashboard Preview */}
              <div className="relative bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
                {/* Browser Chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-800 border-b border-slate-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-slate-700 rounded-md px-3 py-1 text-xs text-slate-400 w-fit">
                      app.scopeguard.io/dashboard
                    </div>
                  </div>
                </div>

                {/* App Content */}
                <div className="flex">
                  {/* Sidebar */}
                  <div className="w-16 bg-gradient-to-b from-indigo-950 to-slate-900 p-3 hidden sm:block">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                      <ShieldCheck className="w-5 h-5 text-white" />
                    </div>
                    <div className="space-y-3">
                      {[BarChart3, Users, FolderKanban].map((Icon, i) => (
                        <div 
                          key={i} 
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            i === 0 ? 'bg-white/10' : ''
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${i === 0 ? 'text-white' : 'text-slate-500'}`} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 bg-slate-100 p-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Good morning, Alex</div>
                        <div className="text-xs text-slate-500">Here's what's happening today</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                      {[
                        { label: 'Revenue Protected', value: '$12,450', icon: DollarSign, color: 'emerald' },
                        { label: 'Active Projects', value: '8', icon: FolderKanban, color: 'indigo' },
                        { label: 'Pending Review', value: '3', icon: Clock, color: 'amber' },
                        { label: 'Scope Creep', value: '2', icon: AlertTriangle, color: 'red' },
                      ].map((stat, i) => (
                        <div key={i} className="bg-white rounded-lg p-2 shadow-sm">
                          <div className={`w-6 h-6 rounded-md bg-${stat.color}-100 flex items-center justify-center mb-1`}>
                            <stat.icon className={`w-3.5 h-3.5 text-${stat.color}-600`} />
                          </div>
                          <div className="text-xs font-bold text-slate-900">{stat.value}</div>
                          <div className="text-[10px] text-slate-500 truncate">{stat.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Alert Card */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span className="text-xs font-medium text-red-800">2 requests need attention</span>
                      </div>
                      <p className="text-[10px] text-red-600 mt-1 ml-6">Create proposals to protect your revenue</p>
                    </div>

                    {/* Project List */}
                    <div className="bg-white rounded-lg shadow-sm">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <span className="text-xs font-semibold text-slate-700">Active Projects</span>
                      </div>
                      {[
                        { name: 'Website Redesign', scope: 2, progress: 75 },
                        { name: 'Mobile App MVP', scope: 0, progress: 40 },
                        { name: 'Brand Identity', scope: 1, progress: 90 },
                      ].map((project, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 border-b border-slate-50 last:border-0">
                          <span className="text-xs text-slate-700">{project.name}</span>
                          <div className="flex items-center gap-2">
                            {project.scope > 0 && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded">
                                {project.scope}
                              </span>
                            )}
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 rounded-full" 
                                style={{ width: `${project.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything you need to protect your projects
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From tracking scope to generating proposals, ScopeGuard has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: FolderKanban,
                title: 'Scope Tracking',
                description: 'Define project scope with clear deliverables. Track progress and keep clients aligned.',
              },
              {
                icon: AlertTriangle,
                title: 'Scope Creep Detection',
                description: 'Automatically flag client requests that fall outside the original scope.',
              },
              {
                icon: FileText,
                title: 'Proposal Generator',
                description: 'Turn out-of-scope requests into paid proposals with one click.',
              },
              {
                icon: BarChart3,
                title: 'Revenue Dashboard',
                description: 'Track how much revenue you\'ve protected from scope creep.',
              },
              {
                icon: Users,
                title: 'Client Management',
                description: 'Organize projects by client with easy access to history and notes.',
              },
              {
                icon: Clock,
                title: 'Request History',
                description: 'Keep a paper trail of all client requests and your responses.',
              },
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              How ScopeGuard Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to protect your revenue
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Define Your Scope',
                description: 'Create a project and list all deliverables. This becomes your source of truth.',
              },
              {
                step: '02',
                title: 'Log Client Requests',
                description: 'When clients ask for changes, log them. ScopeGuard flags what\'s out of scope.',
              },
              {
                step: '03',
                title: 'Generate Proposals',
                description: 'When scope creep is detected, generate a professional proposal in one click to bill for extra work.',
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-indigo-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 -right-4 w-8">
                    <ArrowRight className="w-8 h-8 text-indigo-200" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Start free, upgrade when you need more power
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="relative p-8 rounded-2xl bg-white border border-slate-200">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Free</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-5xl font-bold text-slate-900">$0</span>
                  <span className="text-slate-500">/month</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">Perfect for getting started</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Up to 3 projects',
                  'Up to 2 clients',
                  'Basic scope tracking',
                  'Request logging',
                  'Email support',
                ].map((feature, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <span className="text-slate-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl">
              {/* Founder Pricing Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-sm font-semibold rounded-full flex items-center gap-1">
                <Sparkles className="w-4 h-4" />
                Founder Pricing
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">Pro</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl text-indigo-200 line-through">$29</span>
                  <span className="text-5xl font-bold text-white">$19</span>
                  <span className="text-indigo-200">/month</span>
                </div>
                <p className="mt-2 text-sm text-indigo-200">
                  Lock in this price forever • Limited spots
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited projects',
                  'Unlimited clients',
                  'Scope creep detection',
                  'One-click proposal generator',
                  'Revenue dashboard',
                  'Priority support',
                ].map((feature, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-indigo-300" />
                    <span className="text-indigo-100">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block">
                <Button className="w-full bg-white text-indigo-600 hover:bg-indigo-50">
                  Start Free Trial
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="mt-12 text-center">
            <p className="text-slate-600">
              The average freelancer loses <span className="font-semibold text-slate-900">$500-$2,000/month</span> to scope creep.
              <br />
              ScopeGuard pays for itself with a single protected proposal.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-8 bg-gradient-to-br from-indigo-600 to-purple-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to protect your projects?
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Start tracking scope and detecting out-of-scope requests today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50 w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-white">ScopeGuard</span>
              </div>
              <p className="text-slate-400 text-sm">
                Protect your projects from scope creep and get paid for every hour you work.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-500 text-center">
              © {new Date().getFullYear()} ScopeGuard. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
