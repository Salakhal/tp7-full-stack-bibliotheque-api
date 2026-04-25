import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        error: 'Erreur de validation',
        details: errors
      });
    }

    req[property] = value;
    next();
  };
};

export const validateQueryParams = (req: Request, res: Response, next: NextFunction): void | Response => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().pattern(/^-?[a-zA-Z]+$/),
    search: Joi.string().trim().allow(''),
  });

  const { error, value } = schema.validate(req.query, { abortEarly: false });
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Paramètres de requête invalides',
      details: error.details.map(d => d.message)
    });
  }

  req.query = value;
  next();
};