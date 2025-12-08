import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, HelpCircle, Mail, MessageCircle, FileText, BookOpen, ExternalLink } from 'lucide-react';

export const SupportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">ScopeGuard</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Support Center
          </h1>
          <p className="text-slate-500 max-w-lg mx-auto">
            We're here to help. Find answers to common questions or get in touch with our team.
          </p>
        </div>

        {/* Contact Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Contact Us</h2>
                <p className="text-slate-500 text-sm">Get help from our support team</p>
              </div>
            </div>
            <p className="text-slate-600 mb-6">
              Have a question, issue, or feedback? We'd love to hear from you. Our team typically responds within 24 hours.
            </p>
            <a
              href="mailto:admin@enginecli.dev"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              <Mail className="w-5 h-5" />
              admin@enginecli.dev
            </a>
          </div>
        </div>

        {/* Help Topics */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Getting Started */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Getting Started</h3>
            </div>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Create your first project and define scope items</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Track client requests and detect scope creep</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Generate professional change order proposals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">•</span>
                <span>Manage multiple clients and projects</span>
              </li>
            </ul>
          </div>

          {/* Account & Billing */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Account & Billing</h3>
            </div>
            <ul className="space-y-3 text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Update your profile and business information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Manage your subscription and billing details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Reset your password or recover your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Export or delete your data</span>
              </li>
            </ul>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-slate-900 mb-2">What is scope creep?</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Scope creep refers to uncontrolled changes or continuous growth in a project's scope. It occurs when new features or requirements are added after the project has started, often without proper adjustments to time, budget, or resources.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">How does the AI detection work?</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  ScopeGuard uses AI to analyze incoming client requests and compare them against your defined project scope. It automatically flags requests that fall outside the original agreement, helping you identify potential scope creep early.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Can I customize proposal templates?</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Yes! You can customize your change order proposals with your branding, adjust pricing, and modify the terms. The system generates professional proposals that you can further edit before sending to clients.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">Is my data secure?</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  We take security seriously. All data is encrypted in transit and at rest, and we implement industry-standard security practices. See our{' '}
                  <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
                    Privacy Policy
                  </Link>
                  {' '}for more details.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-slate-900 mb-2">How do I cancel my subscription?</h4>
                <p className="text-slate-600 text-sm leading-relaxed">
                  You can cancel your subscription at any time from your account settings. Your data will be retained for 30 days after cancellation, giving you time to export anything you need.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 md:p-8 text-center">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Still need help?</h3>
          <p className="text-slate-600 mb-4">
            Our team is ready to assist you with any questions or issues.
          </p>
          <a
            href="mailto:admin@enginecli.dev"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <Mail className="w-4 h-4" />
            Email us at admin@enginecli.dev
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <Link to="/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Privacy Policy
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SupportPage;
