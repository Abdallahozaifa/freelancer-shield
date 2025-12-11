import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link2, Copy, Check, Users, FileText, MessageSquare, FileSignature, Settings, Eye, EyeOff } from 'lucide-react';
import { Button, Card, useToast } from '../../components/ui';
import {
  usePortalSettings,
  useUpdatePortalSettings,
  usePortalClients,
  useInviteClientToPortal,
  useRevokeClientPortalAccess,
} from '../../hooks/usePortal';
import type { PortalSettingsUpdate } from '../../types';

export default function PortalPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'clients'>('settings');

  return (
    <div className="p-4 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
        <p className="text-gray-600 mt-1">
          Create a branded portal for your clients to view invoices, files, and communicate with you.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Settings className="w-4 h-4 inline-block mr-2" />
          Portal Settings
        </button>
        <button
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'clients'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline-block mr-2" />
          Client Access
        </button>
      </div>

      {activeTab === 'settings' ? <PortalSettingsTab /> : <ClientAccessTab />}
    </div>
  );
}

function PortalSettingsTab() {
  const { data: settings, isLoading } = usePortalSettings();
  const updateSettings = useUpdatePortalSettings();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<PortalSettingsUpdate>({
    values: settings
      ? {
          business_name: settings.business_name,
          logo_url: settings.logo_url,
          primary_color: settings.primary_color,
          accent_color: settings.accent_color,
          portal_slug: settings.portal_slug,
          contact_email: settings.contact_email,
          contact_phone: settings.contact_phone,
          welcome_message: settings.welcome_message,
          show_invoices: settings.show_invoices,
          show_files: settings.show_files,
          show_messages: settings.show_messages,
          show_contracts: settings.show_contracts,
        }
      : undefined,
  });

  const onSubmit = async (data: PortalSettingsUpdate) => {
    try {
      await updateSettings.mutateAsync(data);
      toast.success('Portal settings updated');
    } catch {
      toast.error('Failed to update settings');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Branding */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              {...register('business_name')}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your Business Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              {...register('logo_url')}
              type="url"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                {...register('primary_color')}
                type="color"
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                {...register('primary_color')}
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#3B82F6"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Accent Color
            </label>
            <div className="flex gap-2">
              <input
                {...register('accent_color')}
                type="color"
                className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              />
              <input
                {...register('accent_color')}
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#10B981"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Portal URL */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Portal URL</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Portal Slug
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">/portal/</span>
            <input
              {...register('portal_slug', {
                pattern: {
                  value: /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
                  message: 'Slug must be lowercase alphanumeric with hyphens',
                },
                minLength: {
                  value: 3,
                  message: 'Slug must be at least 3 characters',
                },
              })}
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your-business"
            />
          </div>
          {errors.portal_slug && (
            <p className="mt-1 text-sm text-red-600">{errors.portal_slug.message}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            This creates a custom URL for your portal. Leave empty to use access tokens only.
          </p>
        </div>
      </Card>

      {/* Contact Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Email
            </label>
            <input
              {...register('contact_email')}
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="contact@yourbusiness.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone
            </label>
            <input
              {...register('contact_phone')}
              type="tel"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Welcome Message
          </label>
          <textarea
            {...register('welcome_message')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Welcome to your client portal! Here you can view project updates, invoices, and more."
          />
        </div>
      </Card>

      {/* Features */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Portal Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              {...register('show_invoices')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <FileText className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Invoices</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              {...register('show_files')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <Link2 className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Files & Documents</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              {...register('show_messages')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <MessageSquare className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Messages</span>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              {...register('show_contracts')}
              type="checkbox"
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <FileSignature className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Contracts</span>
          </label>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={!isDirty || updateSettings.isPending}>
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}

function ClientAccessTab() {
  const { data: clients, isLoading } = usePortalClients();
  const inviteClient = useInviteClientToPortal();
  const revokeAccess = useRevokeClientPortalAccess();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const toast = useToast();

  const handleCopyLink = async (link: string, clientId: string) => {
    const fullUrl = `${window.location.origin}${link}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopiedId(clientId);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Portal link copied to clipboard');
  };

  const handleInvite = async (clientId: string) => {
    try {
      await inviteClient.mutateAsync(clientId);
      toast.success('Client portal access created');
    } catch {
      toast.error('Failed to create portal access');
    }
  };

  const handleRevoke = async (clientId: string) => {
    try {
      await revokeAccess.mutateAsync(clientId);
      toast.success('Portal access revoked');
    } catch {
      toast.error('Failed to revoke access');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!clients || clients.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No clients yet</h3>
        <p className="text-gray-500 mt-1">
          Add clients first, then you can invite them to access their portal.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {clients.map((client) => (
        <Card key={client.client_id} className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-gray-900">{client.client_name}</h3>
              {client.client_email && (
                <p className="text-sm text-gray-500">{client.client_email}</p>
              )}
              {client.last_accessed && (
                <p className="text-xs text-gray-400 mt-1">
                  Last accessed: {new Date(client.last_accessed).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {client.is_active && client.portal_link ? (
                <>
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <Eye className="w-4 h-4" />
                    Active
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyLink(client.portal_link!, client.client_id)}
                  >
                    {copiedId === client.client_id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    <span className="ml-1 hidden sm:inline">Copy Link</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevoke(client.client_id)}
                    disabled={revokeAccess.isPending}
                  >
                    <EyeOff className="w-4 h-4" />
                    <span className="ml-1 hidden sm:inline">Revoke</span>
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleInvite(client.client_id)}
                  disabled={inviteClient.isPending}
                  className="w-full sm:w-auto"
                >
                  <Link2 className="w-4 h-4 mr-1" />
                  Generate Portal Link
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
