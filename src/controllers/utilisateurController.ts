import { Request, Response } from 'express';
import * as utilisateurService from '../services/utilisateurService';
import logger from '../utils/logger';

export const register = async (req: Request, res: Response) => {
  try {
    const { utilisateur, token } = await utilisateurService.register(req.body);
    logger.info(`Nouvel utilisateur inscrit: ${utilisateur.email}`);
    res.status(201).json({
      success: true,
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error: any) {
    logger.error(`Erreur inscription: ${error.message}`);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { utilisateur, token } = await utilisateurService.login(email, password);
    logger.info(`Utilisateur connecté: ${email}`);
    res.status(200).json({
      success: true,
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role
      }
    });
  } catch (error: any) {
    logger.error(`Erreur connexion: ${error.message}`);
    res.status(401).json({ success: false, error: error.message });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const utilisateur = await utilisateurService.getUserById(req.utilisateur._id);
    res.status(200).json({ success: true, data: utilisateur });
  } catch (error: any) {
    logger.error(`Erreur récupération utilisateur courant: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    const utilisateur = await utilisateurService.updateUser(req.utilisateur._id, req.body);
    if (!utilisateur) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    logger.info(`Profil mis à jour: ${utilisateur.email}`);
    return res.status(200).json({ success: true, data: utilisateur });
  } catch (error: any) {
    logger.error(`Erreur mise à jour profil: ${error.message}`);
    return res.status(400).json({ success: false, error: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      role: req.query.role as string,
      estActif: req.query.estActif === 'true'
    };
    const result = await utilisateurService.getAllUsers(options);
    res.status(200).json({ success: true, data: result.utilisateurs, pagination: result.pagination });
  } catch (error: any) {
    logger.error(`Erreur récupération utilisateurs: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleUserStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;
    const utilisateur = await utilisateurService.toggleUserStatus(id);
    if (!utilisateur) {
      return res.status(404).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    logger.info(`Statut utilisateur modifié: ${utilisateur.email} - Actif: ${utilisateur.estActif}`);
    return res.status(200).json({ success: true, data: utilisateur });
  } catch (error: any) {
    logger.error(`Erreur changement statut utilisateur: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};