import { PrismaClient } from '@prisma/client';

// ===========================================
// PRISMA CLIENT SINGLETON
// ===========================================
// Prevents multiple instances during hot reload
// in development (Next.js, nodemon, etc.)
// ===========================================

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const prismaClientOptions: ConstructorParameters<typeof PrismaClient>[0] = {
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
};

export const prisma: PrismaClient =
  globalThis.__prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// ===========================================
// CONNECTION HELPERS
// ===========================================

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('Database disconnected');
}

// ===========================================
// TRANSACTION HELPER
// ===========================================

export type TransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export async function withTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(fn);
}

// Default export for convenience
export default prisma;
