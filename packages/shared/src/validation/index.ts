import { z } from 'zod';
import {
  ProjectStatus,
  RequestSource,
  ScopeClassification,
  RequestStatus,
  ProposalStatus,
} from '../types';

// ===========================================
// COMMON SCHEMAS
// ===========================================

export const uuidSchema = z.string().uuid('Invalid ID format');

export const emailSchema = z
  .string()
  .email('Invalid email format')
  .max(255, 'Email too long');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name too long');

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// ===========================================
// AUTH SCHEMAS
// ===========================================

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ===========================================
// CLIENT SCHEMAS
// ===========================================

export const createClientSchema = z.object({
  name: nameSchema,
  email: emailSchema.optional().nullable(),
  company: z.string().max(200).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateClientSchema = createClientSchema.partial();

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;

// ===========================================
// PROJECT SCHEMAS
// ===========================================

export const projectStatusSchema = z.nativeEnum(ProjectStatus);

export const createProjectSchema = z.object({
  clientId: uuidSchema,
  name: z.string().min(1, 'Project name required').max(200),
  description: z.string().max(2000).optional().nullable(),
  budget: z.number().positive().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: projectStatusSchema.optional(),
  budget: z.number().positive().optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

// ===========================================
// SCOPE ITEM SCHEMAS
// ===========================================

export const createScopeItemSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().max(50).optional().nullable(),
  estimatedHours: z.number().positive().max(1000).optional().nullable(),
});

export const updateScopeItemSchema = createScopeItemSchema.partial().extend({
  isCompleted: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderScopeItemsSchema = z.object({
  items: z.array(
    z.object({
      id: uuidSchema,
      order: z.number().int().min(0),
    })
  ),
});

export type CreateScopeItemInput = z.infer<typeof createScopeItemSchema>;
export type UpdateScopeItemInput = z.infer<typeof updateScopeItemSchema>;
export type ReorderScopeItemsInput = z.infer<typeof reorderScopeItemsSchema>;

// ===========================================
// CLIENT REQUEST SCHEMAS
// ===========================================

export const requestSourceSchema = z.nativeEnum(RequestSource);
export const scopeClassificationSchema = z.nativeEnum(ScopeClassification);
export const requestStatusSchema = z.nativeEnum(RequestStatus);

export const createClientRequestSchema = z.object({
  content: z.string().min(1, 'Request content required').max(5000),
  source: requestSourceSchema.default(RequestSource.MANUAL),
  autoAnalyze: z.boolean().default(false),
});

export const updateClientRequestSchema = z.object({
  classification: scopeClassificationSchema.optional(),
  linkedScopeId: uuidSchema.optional().nullable(),
  status: requestStatusSchema.optional(),
  estimatedHours: z.number().positive().max(1000).optional().nullable(),
});

export type CreateClientRequestInput = z.infer<typeof createClientRequestSchema>;
export type UpdateClientRequestInput = z.infer<typeof updateClientRequestSchema>;

// ===========================================
// PROPOSAL SCHEMAS
// ===========================================

export const proposalStatusSchema = z.nativeEnum(ProposalStatus);

export const createProposalSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  description: z.string().min(1, 'Description required').max(5000),
  price: z.number().positive('Price must be positive'),
  estimatedHours: z.number().positive().max(1000).optional().nullable(),
});

export const createProposalFromRequestSchema = z.object({
  price: z.number().positive('Price must be positive'),
  estimatedHours: z.number().positive().max(1000).optional().nullable(),
  customTitle: z.string().max(200).optional(),
  customDescription: z.string().max(5000).optional(),
});

export const updateProposalSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  price: z.number().positive().optional(),
  estimatedHours: z.number().positive().max(1000).optional().nullable(),
  status: proposalStatusSchema.optional(),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
export type CreateProposalFromRequestInput = z.infer<typeof createProposalFromRequestSchema>;
export type UpdateProposalInput = z.infer<typeof updateProposalSchema>;

// ===========================================
// VALIDATION HELPER
// ===========================================

export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details: Record<string, string> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join('.');
      details[path] = err.message;
    });
    // Import ValidationError from errors
    throw new (require('../errors').ValidationError)(
      'Validation failed',
      details
    );
  }
  return result.data;
}
