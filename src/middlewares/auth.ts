import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import Utilisateur from '../models/Utilisateur';

declare global {
  namespace Express {
    interface Request {
      utilisateur?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé - Token manquant'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.utilisateur = await Utilisateur.findById(decoded.id).select('-password');
    
    if (!req.utilisateur) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    if (!req.utilisateur.estActif) {
      return res.status(401).json({
        success: false,
        error: 'Compte désactivé'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Non autorisé - Token invalide ou expiré'
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void | Response => {
    if (!req.utilisateur) {
      return res.status(401).json({
        success: false,
        error: 'Non autorisé'
      });
    }

    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        success: false,
        error: `Accès interdit - Le rôle ${req.utilisateur.role} n'a pas les permissions nécessaires`
      });
    }

    next();
  };
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      req.utilisateur = await Utilisateur.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignorer l'erreur, l'utilisateur reste non authentifié
    }
  }

  next();
};