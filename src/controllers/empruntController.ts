import { Request, Response } from 'express';
import * as empruntService from '../services/empruntService';
import logger from '../utils/logger';

export const createEmprunt = async (req: Request, res: Response) => {
  try {
    const emprunt = await empruntService.createEmprunt(req.body);
    logger.info(`Emprunt créé: livre ${emprunt.livre} par utilisateur ${emprunt.utilisateur}`);
    res.status(201).json({ success: true, data: emprunt });
  } catch (error: any) {
    logger.error(`Erreur création emprunt: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllEmprunts = async (req: Request, res: Response) => {
  try {
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      statut: req.query.statut as string,
      utilisateur: req.query.utilisateur as string
    };
    const result = await empruntService.getAllEmprunts(options);
    res.status(200).json({ success: true, data: result.emprunts, pagination: result.pagination });
  } catch (error: any) {
    logger.error(`Erreur récupération emprunts: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEmpruntById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;
    const emprunt = await empruntService.getEmpruntById(id);
    if (!emprunt) {
      return res.status(404).json({ success: false, error: 'Emprunt non trouvé' });
    }
    return res.status(200).json({ success: true, data: emprunt });
  } catch (error: any) {
    logger.error(`Erreur récupération emprunt ${req.params.id}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const retourEmprunt = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;
    const emprunt = await empruntService.retourEmprunt(id);
    if (!emprunt) {
      return res.status(404).json({ success: false, error: 'Emprunt non trouvé' });
    }
    logger.info(`Emprunt retourné: ${id}`);
    return res.status(200).json({ success: true, data: emprunt });
  } catch (error: any) {
    logger.error(`Erreur retour emprunt ${req.params.id}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteEmprunt = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;
    const deleted = await empruntService.deleteEmprunt(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Emprunt non trouvé' });
    }
    logger.info(`Emprunt supprimé: ${id}`);
    return res.status(204).send();
  } catch (error: any) {
    logger.error(`Erreur suppression emprunt ${req.params.id}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};