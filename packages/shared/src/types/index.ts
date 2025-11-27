// ===========================================
// ENUMS (match Prisma schema)
// ===========================================

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum RequestSource {
  MANUAL = 'MANUAL',
  EMAIL = 'EMAIL',
  SLACK = 'SLACK',
  FORM = 'FORM',
}

export enum ScopeClassification {
  PENDING = 'PENDING',
  IN_SCOPE = 'IN_SCOPE',
  OUT_OF_SCOPE = 'OUT_OF_SCOPE',
  CLARIFICATION_NEEDED = 'CLARIFICATION_NEEDED',
  REVISION = 'REVISION',
}

export enum RequestStatus {
  NEW = 'NEW',
  REVIEWED = 'REVIEWED',
  ACCEPTED = 'ACCEPTED',
  CONVERTED_TO_PROPOSAL = 'CONVERTED_TO_PROPOSAL',
  DECLINED = 'DECLINED',
}

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  EXPIRED = 'EXPIRED',
}

// ===========================================
// ENTITY TYPES
// ===========================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  company: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  userId: string;
  clientId: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  budget: number | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ScopeItem {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  category: string | null;
  estimatedHours: number | null;
  isCompleted: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientRequest {
  id: string;
  projectId: string;
  linkedScopeId: string | null;
  content: string;
  source: RequestSource;
  classification: ScopeClassification;
  confidence: number | null;
  reasoning: string | null;
  status: RequestStatus;
  estimatedHours: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Proposal {
  id: string;
  projectId: string;
  requestId: string | null;
  title: string;
  description: string;
  price: number;
  estimatedHours: number | null;
  status: ProposalStatus;
  sentAt: Date | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===========================================
// AUTH TYPES
// ===========================================

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
}

export interface RegisterResponse {
  user: AuthUser;
  token: string;
}

// ===========================================
// SCOPE ANALYZER TYPES
// ===========================================

export interface ScopeAnalysisInput {
  projectDescription: string;
  scopeItems: Array<{
    title: string;
    description: string | null;
    category: string | null;
  }>;
  requestContent: string;
}

export interface ScopeAnalysisResult {
  classification: ScopeClassification;
  confidence: number;
  reasoning: string;
  matchedScopeItemIndex: number | null;
  suggestedAction: 'accept' | 'propose' | 'clarify';
  scopeCreepIndicators: string[];
}

// ===========================================
// DASHBOARD TYPES
// ===========================================

export interface DashboardSummary {
  activeProjects: number;
  totalClients: number;
  pendingRequests: number;
  outOfScopeThisMonth: number;
  proposalsSentThisMonth: number;
  proposalsAcceptedThisMonth: number;
  revenueRecoveredThisMonth: number;
}

export interface DashboardAlert {
  type: 'OUT_OF_SCOPE' | 'SCOPE_CREEP_PATTERN' | 'PAYMENT_DUE';
  severity: 'low' | 'medium' | 'high';
  message: string;
  projectId: string;
  projectName: string;
  requestId?: string;
}

export interface ProjectHealth {
  scopeHealth: {
    score: number;
    totalItems: number;
    completedItems: number;
    percentComplete: number;
  };
  requestHealth: {
    total: number;
    inScope: number;
    outOfScope: number;
    pending: number;
    outOfScopePercentage: number;
  };
  financialHealth: {
    budget: number | null;
    proposalsSent: number;
    proposalsAccepted: number;
    additionalRevenue: number;
  };
}
