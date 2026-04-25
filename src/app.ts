import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import v1Routes from './routes/v1';
import { errorHandler, notFound } from './middlewares/errorHandler';
import { setupSwagger } from './utils/swagger';
import logger from './utils/logger';

dotenv.config();

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
  logger.debug(`${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/v1', v1Routes);

// Swagger documentation
setupSwagger(app);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'API Bibliothèque',
    version: '1.0.0',
    description: 'API RESTful pour la gestion de bibliothèque',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;