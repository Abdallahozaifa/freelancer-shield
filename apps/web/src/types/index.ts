// Enums
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';
export type RequestSource = 'email' | 'chat' | 'call' | 'meeting' | 'other';
export type ScopeClassification = 'in_scope' | 'out_of_scope' | 'clarification_needed' | 'revision' | 'pending';
export type RequestStatus = 'new' | 'analyzed' | 'addressed' | 'proposal_sent' | 'declined';
export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

// Models
export interface User {
  id: string;
  email: string;
  full_name: string;
  business_name: string | null;
  is_active: boolean;
  picture?: string | null;
  auth_provider?: string | null;
  created_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  notes: string | null;
  project_count: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Index signature for Table component
}

export interface ClientCreate {
  name: string;
  email?: string | null;
  company?: string | null;
  notes?: string | null;
}

export interface ClientUpdate {
  name?: string;
  email?: string | null;
  company?: string | null;
  notes?: string | null;
}

export interface Project {
  id: string;
  client_id: string;
  client_name: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  hourly_rate: number | null;
  estimated_hours: number | null;
  scope_item_count: number;
  completed_scope_count: number;
  out_of_scope_request_count: number;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Index signature for Table component
}

export interface ProjectCreate {
  client_id: string;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  budget?: number | null;
  hourly_rate?: number | null;
  estimated_hours?: number | null;
}

export interface ProjectUpdate {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  budget?: number | null;
  hourly_rate?: number | null;
  estimated_hours?: number | null;
}

export interface ScopeItem {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  order: number;
  is_completed: boolean;
  estimated_hours: number | null;
  created_at: string;
  updated_at: string;
}

export interface ScopeItemCreate {
  title: string;
  description?: string | null;
  order?: number;
  is_completed?: boolean;
  estimated_hours?: number | null;
}

export interface ScopeItemUpdate {
  title?: string;
  description?: string | null;
  order?: number;
  is_completed?: boolean;
  estimated_hours?: number | null;
}

export interface ClientRequest {
  id: string;
  project_id: string;
  linked_scope_item_id: string | null;
  linked_scope_item_title: string | null;
  title: string;
  content: string;
  source: RequestSource;
  status: RequestStatus;
  classification: ScopeClassification | null;
  confidence: number | null;
  analysis_reasoning: string | null;
  suggested_action: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientRequestCreate {
  title: string;
  content: string;
  source?: RequestSource;
}

export interface ClientRequestUpdate {
  title?: string;
  content?: string;
  source?: RequestSource;
  status?: RequestStatus;
  classification?: ScopeClassification | null;
  linked_scope_item_id?: string | null;
}

export interface Proposal {
  id: string;
  project_id: string;
  source_request_id: string | null;
  title: string;
  description: string;
  status: ProposalStatus;
  amount: number;
  estimated_hours: number | null;
  sent_at: string | null;
  responded_at: string | null;
  source_request_title: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // Index signature for Table component
}

export interface ProposalCreate {
  title: string;
  description: string;
  amount: number;
  estimated_hours?: number | null;
  source_request_id?: string | null;
}

export interface ProposalUpdate {
  title?: string;
  description?: string;
  status?: ProposalStatus;
  amount?: number;
  estimated_hours?: number | null;
}

// Dashboard types
export interface DashboardSummary {
  total_projects: number;
  active_projects: number;
  total_clients: number;
  total_requests: number;
  out_of_scope_requests: number;
  pending_requests: number;
  total_proposals: number;
  pending_proposals: number;
  accepted_proposals: number;
  total_revenue_protected: number;
  // Additional fields used by dashboard
  revenue_protected: number;
  proposals_accepted: number;
  completed_scope_items: number;
}

export interface Alert {
  id: string;
  type: 'scope_creep' | 'pending_request' | 'proposal_expiring' | 'milestone_overdue';
  severity: 'low' | 'medium' | 'high' | 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  project_id: string;
  project_name: string;
  related_id: string | null;
  created_at: string;
}

export interface ProjectHealth {
  project_id: string;
  project_name: string;
  status: ProjectStatus;
  scope_completion_percentage: number;
  scope_items_total: number;
  scope_items_completed: number;
  total_requests: number;
  in_scope_requests: number;
  out_of_scope_requests: number;
  pending_analysis: number;
  scope_creep_ratio: number;
  budget: number | null;
  proposals_sent: number;
  proposals_accepted: number;
  revenue_protected: number;
  health_score: number;
}

export interface RecentActivity {
  type: 'request_created' | 'request_analyzed' | 'proposal_sent' | 'proposal_accepted' | 'scope_completed';
  message: string;
  project_id: string;
  project_name: string;
  timestamp: string;
}

// Scope Analysis types
export interface ScopeAnalysisRequest {
  content: string;
  title?: string;
}

export interface ScopeAnalysisResult {
  classification: ScopeClassification;
  confidence: number;
  reasoning: string;
  suggested_action: string;
  matched_scope_items: string[];
  indicators: ScopeIndicator[];
}

export interface ScopeIndicator {
  type: string;
  description: string;
  weight: number;
}

// API Response types
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

export interface ApiError {
  detail: string;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  business_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface GoogleAuthRequest {
  credential: string;
}

export interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  is_new_user: boolean;
}

// Password Reset types
export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
  email?: string;
}

// Portal types
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
export type FileCategory = 'contract' | 'deliverable' | 'invoice' | 'asset' | 'reference' | 'other';
export type MessageStatus = 'unread' | 'read' | 'archived';

export interface PortalSettings {
  id: string;
  business_name: string | null;
  logo_url: string | null;
  primary_color: string;
  accent_color: string;
  portal_slug: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  welcome_message: string | null;
  show_invoices: boolean;
  show_files: boolean;
  show_messages: boolean;
  show_contracts: boolean;
  portal_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortalSettingsCreate {
  business_name?: string | null;
  logo_url?: string | null;
  primary_color?: string;
  accent_color?: string;
  portal_slug?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  welcome_message?: string | null;
  show_invoices?: boolean;
  show_files?: boolean;
  show_messages?: boolean;
  show_contracts?: boolean;
}

export interface PortalSettingsUpdate extends PortalSettingsCreate {}

export interface ClientPortalAccess {
  id: string;
  client_id: string;
  client_name: string | null;
  client_email: string | null;
  is_active: boolean;
  last_accessed: string | null;
  portal_link: string | null;
  created_at: string;
}

export interface PortalInvoice {
  id: string;
  client_id: string;
  client_name?: string | null;
  project_id: string | null;
  project_name?: string | null;
  invoice_number: string;
  title: string;
  description: string | null;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: InvoiceStatus;
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  payment_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortalInvoiceCreate {
  client_id: string;
  project_id?: string | null;
  invoice_number: string;
  title: string;
  description?: string | null;
  amount: number;
  tax_amount?: number;
  due_date?: string | null;
  payment_url?: string | null;
}

export interface PortalInvoiceUpdate {
  title?: string;
  description?: string | null;
  amount?: number;
  tax_amount?: number;
  status?: InvoiceStatus;
  due_date?: string | null;
  payment_url?: string | null;
}

export interface PortalFile {
  id: string;
  client_id: string;
  client_name?: string | null;
  project_id: string | null;
  project_name?: string | null;
  name: string;
  file_url: string;
  file_size: number | null;
  file_type: string | null;
  category: FileCategory;
  description: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortalFileCreate {
  client_id: string;
  project_id?: string | null;
  name: string;
  file_url: string;
  file_size?: number | null;
  file_type?: string | null;
  category?: FileCategory;
  description?: string | null;
  is_visible?: boolean;
}

export interface PortalMessage {
  id: string;
  client_id: string;
  client_name?: string | null;
  project_id: string | null;
  project_name?: string | null;
  subject: string | null;
  content: string;
  is_from_client: boolean;
  status: MessageStatus;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortalMessageCreate {
  client_id: string;
  project_id?: string | null;
  subject?: string | null;
  content: string;
}

export interface PortalContract {
  id: string;
  client_id: string;
  client_name?: string | null;
  project_id: string | null;
  project_name?: string | null;
  title: string;
  content: string;
  file_url: string | null;
  requires_signature: boolean;
  signed_at: string | null;
  is_signed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PortalContractCreate {
  client_id: string;
  project_id?: string | null;
  title: string;
  content: string;
  file_url?: string | null;
  requires_signature?: boolean;
}

export interface PortalDashboard {
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
  pending_invoices_total: number;
  unread_messages_count: number;
  unsigned_contracts_count: number;
  files_count: number;
  recent_invoices: PortalInvoice[];
  recent_messages: PortalMessage[];
  recent_files: PortalFile[];
}
