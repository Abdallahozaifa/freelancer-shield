import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, AlertCircle, Loader2, FileText, FolderOpen, MessageSquare, FileSignature, Mail, Phone, DollarSign, Clock, CheckCircle } from 'lucide-react';

interface PortalDashboard {
  client_name: string;
  freelancer_name: string;
  freelancer_business_name: string | null;
  welcome_message: string | null;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  show_invoices: boolean;
  show_files: boolean;
  show_messages: boolean;
  show_contracts: boolean;
  active_projects_count: number;
  pending_invoices_count: number;
  pending_invoices_total: string;
  unread_messages_count: number;
  unsigned_contracts_count: number;
  files_count: number;
  recent_invoices: Invoice[];
  recent_messages: Message[];
  recent_files: FileItem[];
}

interface Invoice {
  id: string;
  invoice_number: string;
  title: string;
  total_amount: string;
  status: string;
  due_date: string | null;
}

interface Message {
  id: string;
  subject: string;
  content: string;
  is_from_client: boolean;
  status: string;
  created_at: string;
}

interface FileItem {
  id: string;
  name: string;
  file_url: string;
  file_type: string | null;
  created_at: string;
}

type PageStatus = 'loading' | 'ready' | 'error' | 'invalid_token';

export function ClientPortalPage() {
  const { token } = useParams<{ token: string }>();
  const [dashboard, setDashboard] = useState<PortalDashboard | null>(null);
  const [status, setStatus] = useState<PageStatus>('loading');
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'files' | 'messages' | 'contracts'>('overview');

  useEffect(() => {
    async function fetchDashboard() {
      if (!token) {
        setStatus('invalid_token');
        return;
      }

      try {
        // In production, API is on same origin at /api/v1. In dev, use VITE_API_URL or localhost
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:8000');
        const response = await fetch(`${apiUrl}/api/v1/client-portal/dashboard`, {
          headers: {
            'X-Portal-Token': token,
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 404) {
            setStatus('invalid_token');
            return;
          }
          throw new Error('Failed to load portal');
        }

        const data = await response.json();
        setDashboard(data);
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    }

    fetchDashboard();
  }, [token]);

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading your portal...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (status === 'invalid_token') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Portal Access Denied</h1>
          <p className="text-slate-600 mb-6">
            This portal link may be invalid, expired, or revoked. Please contact your freelancer for a new access link.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to ScopeGuard
          </Link>
        </div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h1>
          <p className="text-slate-600 mb-6">
            We couldn't load your portal. Please try again later.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const businessName = dashboard.freelancer_business_name || dashboard.freelancer_name;

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      style={{ '--portal-primary': dashboard.primary_color, '--portal-accent': dashboard.accent_color } as React.CSSProperties}
    >
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dashboard.logo_url ? (
              <img
                src={dashboard.logo_url}
                alt={businessName}
                className="w-10 h-10 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: dashboard.primary_color || '#6366f1' }}
              >
                <Shield className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="font-bold text-slate-900">{businessName}</h1>
              <p className="text-xs text-slate-500">Client Portal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-600">Welcome,</p>
            <p className="font-medium text-slate-900">{dashboard.client_name}</p>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </TabButton>
            {dashboard.show_invoices && (
              <TabButton
                active={activeTab === 'invoices'}
                onClick={() => setActiveTab('invoices')}
                badge={dashboard.pending_invoices_count || undefined}
              >
                Invoices
              </TabButton>
            )}
            {dashboard.show_files && (
              <TabButton
                active={activeTab === 'files'}
                onClick={() => setActiveTab('files')}
              >
                Files
              </TabButton>
            )}
            {dashboard.show_messages && (
              <TabButton
                active={activeTab === 'messages'}
                onClick={() => setActiveTab('messages')}
                badge={dashboard.unread_messages_count || undefined}
              >
                Messages
              </TabButton>
            )}
            {dashboard.show_contracts && (
              <TabButton
                active={activeTab === 'contracts'}
                onClick={() => setActiveTab('contracts')}
                badge={dashboard.unsigned_contracts_count || undefined}
              >
                Contracts
              </TabButton>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        {dashboard.welcome_message && activeTab === 'overview' && (
          <div
            className="rounded-xl p-6 mb-8 text-white"
            style={{ backgroundColor: dashboard.primary_color || '#6366f1' }}
          >
            <p className="text-lg">{dashboard.welcome_message}</p>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<FolderOpen className="w-5 h-5" />}
                label="Active Projects"
                value={dashboard.active_projects_count}
                color="blue"
              />
              {dashboard.show_invoices && (
                <StatCard
                  icon={<DollarSign className="w-5 h-5" />}
                  label="Pending Invoices"
                  value={dashboard.pending_invoices_count}
                  subtext={`$${parseFloat(dashboard.pending_invoices_total).toFixed(2)}`}
                  color="amber"
                />
              )}
              {dashboard.show_messages && (
                <StatCard
                  icon={<MessageSquare className="w-5 h-5" />}
                  label="Unread Messages"
                  value={dashboard.unread_messages_count}
                  color="green"
                />
              )}
              {dashboard.show_contracts && (
                <StatCard
                  icon={<FileSignature className="w-5 h-5" />}
                  label="Pending Signatures"
                  value={dashboard.unsigned_contracts_count}
                  color="purple"
                />
              )}
            </div>

            {/* Recent Items */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Invoices */}
              {dashboard.show_invoices && dashboard.recent_invoices.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    Recent Invoices
                  </h3>
                  <div className="space-y-3">
                    {dashboard.recent_invoices.slice(0, 3).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">{invoice.title}</p>
                          <p className="text-sm text-slate-500">#{invoice.invoice_number}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">${parseFloat(invoice.total_amount).toFixed(2)}</p>
                          <InvoiceStatusBadge status={invoice.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {dashboard.recent_invoices.length > 3 && (
                    <button
                      onClick={() => setActiveTab('invoices')}
                      className="w-full mt-4 text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View all invoices
                    </button>
                  )}
                </div>
              )}

              {/* Recent Messages */}
              {dashboard.show_messages && dashboard.recent_messages.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-slate-400" />
                    Recent Messages
                  </h3>
                  <div className="space-y-3">
                    {dashboard.recent_messages.slice(0, 3).map((msg) => (
                      <div key={msg.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-slate-900">{msg.subject}</p>
                          {msg.status === 'unread' && !msg.is_from_client && (
                            <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">New</span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 line-clamp-2">{msg.content}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(msg.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                  {dashboard.recent_messages.length > 3 && (
                    <button
                      onClick={() => setActiveTab('messages')}
                      className="w-full mt-4 text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      View all messages
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'invoices' && dashboard.show_invoices && (
          <InvoicesTab invoices={dashboard.recent_invoices} />
        )}

        {activeTab === 'files' && dashboard.show_files && (
          <FilesTab files={dashboard.recent_files} />
        )}

        {activeTab === 'messages' && dashboard.show_messages && (
          <MessagesTab messages={dashboard.recent_messages} />
        )}

        {activeTab === 'contracts' && dashboard.show_contracts && (
          <ContractsTab />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 mt-auto">
        <p className="text-center text-sm text-slate-500">
          Powered by{' '}
          <Link to="/" className="text-indigo-600 hover:text-indigo-700 font-medium">
            ScopeGuard
          </Link>
        </p>
      </footer>
    </div>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  badge,
  children
}: {
  active: boolean;
  onClick: () => void;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
        active
          ? 'border-indigo-600 text-indigo-600'
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
      }`}
    >
      {children}
      {badge !== undefined && badge > 0 && (
        <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  subtext,
  color
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  subtext?: string;
  color: 'blue' | 'amber' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-emerald-50 text-emerald-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
  );
}

// Invoice Status Badge
function InvoiceStatusBadge({ status }: { status: string }) {
  const statusStyles: Record<string, string> = {
    paid: 'bg-emerald-100 text-emerald-700',
    sent: 'bg-blue-100 text-blue-700',
    viewed: 'bg-indigo-100 text-indigo-700',
    overdue: 'bg-red-100 text-red-700',
    draft: 'bg-slate-100 text-slate-700',
  };

  return (
    <span className={`px-2 py-0.5 text-xs rounded-full ${statusStyles[status] || statusStyles.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Invoices Tab
function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No invoices yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="grid gap-px bg-slate-200">
        {invoices.map((invoice) => (
          <div key={invoice.id} className="bg-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{invoice.title}</p>
                <p className="text-sm text-slate-500">#{invoice.invoice_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {invoice.due_date && (
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400">Due date</p>
                  <p className="text-sm text-slate-600">
                    {new Date(invoice.due_date).toLocaleDateString()}
                  </p>
                </div>
              )}
              <div className="text-right">
                <p className="font-semibold text-slate-900">${parseFloat(invoice.total_amount).toFixed(2)}</p>
                <InvoiceStatusBadge status={invoice.status} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Files Tab
function FilesTab({ files }: { files: FileItem[] }) {
  if (files.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No files shared yet</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {files.map((file) => (
        <a
          key={file.id}
          href={file.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="font-medium text-slate-900 truncate">{file.name}</p>
          <p className="text-sm text-slate-500">{file.file_type || 'File'}</p>
          <p className="text-xs text-slate-400 mt-2">
            {new Date(file.created_at).toLocaleDateString()}
          </p>
        </a>
      ))}
    </div>
  );
}

// Messages Tab
function MessagesTab({ messages }: { messages: Message[] }) {
  if (messages.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">No messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`bg-white rounded-xl border border-slate-200 p-4 ${
            msg.is_from_client ? 'ml-8' : 'mr-8'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                msg.is_from_client
                  ? 'bg-slate-100 text-slate-600'
                  : 'bg-indigo-100 text-indigo-600'
              }`}>
                {msg.is_from_client ? 'You' : 'Freelancer'}
              </span>
              <p className="font-medium text-slate-900">{msg.subject}</p>
            </div>
            <p className="text-xs text-slate-400">
              {new Date(msg.created_at).toLocaleDateString()}
            </p>
          </div>
          <p className="text-slate-600">{msg.content}</p>
        </div>
      ))}
    </div>
  );
}

// Contracts Tab (placeholder)
function ContractsTab() {
  return (
    <div className="text-center py-12">
      <FileSignature className="w-12 h-12 text-slate-300 mx-auto mb-4" />
      <p className="text-slate-500">No contracts to sign</p>
    </div>
  );
}

export default ClientPortalPage;
