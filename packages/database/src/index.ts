// ===========================================
// @freelancer-shield/database
// ===========================================
// Database client and utilities
// ===========================================

// Prisma client
export {
  prisma,
  connectDatabase,
  disconnectDatabase,
  withTransaction,
  type TransactionClient,
} from './client';

// Re-export Prisma types for convenience
export type {
  User,
  Client,
  Project,
  ScopeItem,
  ClientRequest,
  Proposal,
} from '@prisma/client';

export {
  ProjectStatus,
  RequestSource,
  ScopeClassification,
  RequestStatus,
  ProposalStatus,
} from '@prisma/client';

// Default export
export { prisma as default } from './client';
