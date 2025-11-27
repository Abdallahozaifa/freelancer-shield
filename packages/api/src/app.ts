import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { AppError, formatErrorResponse, isAppError } from '@freelancer-shield/shared';

// ===========================================
// EXPRESS APP CONFIGURATION
// ===========================================

export function createApp(): Application {
  const app = express();

  // ===========================================
  // MIDDLEWARE
  // ===========================================

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    })
  );

  // Request logging
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ===========================================
  // HEALTH CHECK
  // ===========================================

  app.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    });
  });

  // ===========================================
  // API ROUTES
  // ===========================================
  // Routes will be added here as modules are built:
  //
  // app.use('/api/auth', authRoutes);
  // app.use('/api/users', userRoutes);
  // app.use('/api/clients', clientRoutes);
  // app.use('/api/projects', projectRoutes);
  // app.use('/api/dashboard', dashboardRoutes);

  // Placeholder for now
  app.get('/api', (_req: Request, res: Response) => {
    res.json({
      message: 'Freelancer Shield API',
      version: '0.1.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth (coming soon)',
        projects: '/api/projects (coming soon)',
      },
    });
  });

  // ===========================================
  // 404 HANDLER
  // ===========================================

  app.use((_req: Request, _res: Response, next: NextFunction) => {
    next(new AppError('Route not found', 404, 'NOT_FOUND'));
  });

  // ===========================================
  // ERROR HANDLER
  // ===========================================

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    // Log error
    if (process.env.NODE_ENV !== 'test') {
      console.error('Error:', err);
    }

    // Handle known errors
    if (isAppError(err)) {
      return res.status(err.statusCode).json(formatErrorResponse(err));
    }

    // Handle unknown errors
    const statusCode = 500;
    return res.status(statusCode).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message:
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : err.message,
      },
    });
  });

  return app;
}

export default createApp;
