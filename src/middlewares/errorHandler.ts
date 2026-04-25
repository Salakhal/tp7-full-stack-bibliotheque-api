import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

interface CustomError extends Error {
  statusCode?: number;
  code?: number;
  errors?: any;
  keyValue?: any;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  logger.error(`${err.message} - ${req.method} ${req.url} - ${req.ip}`);

  if (err.name === 'CastError') {
    error.message = 'Ressource non trouvée';
    error.statusCode = 404;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error.message = `${field} déjà utilisé`;
    error.statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors || {}).map((val: any) => val.message).join(', ');
    error.statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token invalide';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expiré';
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: `Route non trouvée: ${req.method} ${req.originalUrl}`
  });
};