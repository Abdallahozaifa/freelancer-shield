import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ProjectInfo {
  project_name: string;
  client_name: string;
  freelancer_name: string;
}

interface FormData {
  title: string;
  description: string;
  client_name: string;
  client_email: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error' | 'not_found';

export function PublicRequestPage() {
  const { token } = useParams<{ token: string }>();
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    client_name: '',
    client_email: '',
  });
  const [status, setStatus] = useState<FormStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch project info on mount
  useEffect(() => {
    async function fetchProjectInfo() {
      if (!token) {
        setStatus('not_found');
        return;
      }

      try {
        // In production, API is on same origin at /api/v1. In dev, use VITE_API_URL or localhost
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');
        const response = await fetch(`${apiUrl}/api/v1/request/${token}`);

        if (!response.ok) {
          if (response.status === 404) {
            setStatus('not_found');
            return;
          }
          throw new Error('Failed to load project info');
        }

        const data = await response.json();
        setProjectInfo(data);
        setStatus('idle');
      } catch {
        setStatus('not_found');
      }
    }

    fetchProjectInfo();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      // In production, API is on same origin at /api/v1. In dev, use VITE_API_URL or localhost
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');
      const response = await fetch(`${apiUrl}/api/v1/request/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to submit request');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  // Loading state
  if (status === 'loading' && !projectInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (status === 'not_found') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Request Form Not Found</h1>
          <p className="text-slate-600 mb-6">
            This request form link may be invalid or the freelancer has disabled public requests for this project.
          </p>
          <Link to="/">
            <Button variant="outline">Go to ScopeGuard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h1>
          <p className="text-slate-600 mb-6">
            Thank you for your request. {projectInfo?.freelancer_name || 'The freelancer'} will review it and get back to you shortly.
          </p>
          <button
            onClick={() => {
              setStatus('idle');
              setFormData({ title: '', description: '', client_name: '', client_email: '' });
            }}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Submit another request
          </button>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">ScopeGuard</span>
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Project Info Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              Submit a Request
            </h1>
            <p className="text-slate-600">
              for <span className="font-medium text-slate-900">{projectInfo?.project_name}</span>
            </p>
            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-500">
              <span>Client: {projectInfo?.client_name}</span>
              <span className="text-slate-300">|</span>
              <span>Freelancer: {projectInfo?.freelancer_name}</span>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-2">
                Request Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Add user authentication feature"
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please describe what you need in detail..."
                rows={5}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
                required
              />
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Optional Contact Info</span>
              </div>
            </div>

            {/* Name & Email Row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="client_name" className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="client_name"
                  value={formData.client_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>
              <div>
                <label htmlFor="client_email" className="block text-sm font-medium text-slate-700 mb-2">
                  Your Email
                </label>
                <input
                  type="email"
                  id="client_email"
                  value={formData.client_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, client_email: e.target.value }))}
                  placeholder="john@example.com"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-900 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Footer Note */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Powered by{' '}
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ScopeGuard
          </Link>
        </p>
      </main>
    </div>
  );
}

export default PublicRequestPage;
