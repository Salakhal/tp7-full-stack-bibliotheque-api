import { Request, Response } from 'express';
import * as livreService from '../services/livreService';
import logger from '../utils/logger';

export const createLivre = async (req: Request, res: Response) => {
  try {
    const livre = await livreService.createLivre(req.body);
    logger.info(`Livre créé: ${livre.titre}`);
    res.status(201).json({ success: true, data: livre });
  } catch (error: any) {
    logger.error(`Erreur création livre: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllLivres = async (req: Request, res: Response) => {
  try {
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: req.query.sort as string,
      genre: req.query.genre as string,
      disponible: req.query.disponible === 'true',
      search: req.query.search as string
    };
    const result = await livreService.getAllLivres(options);
    res.status(200).json({ success: true, data: result.livres, pagination: result.pagination });
  } catch (error: any) {
    logger.error(`Erreur récupération livres: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getLivreById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;
    const livre = await livreService.getLivreById(id);
    if (!livre) {
      return res.status(404).json({ success: false, error: 'Livre non trouvé' });
    }
    return res.status(200).json({ success: true, data: livre });
  } catch (error: any) {
    logger.error(`Erreur récupération livre ${req.params.id}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateLivre = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;
    const livre = await livreService.updateLivre(id, req.body);
    if (!livre) {
      return res.status(404).json({ success: false, error: 'Livre non trouvé' });
    }
    logger.info(`Livre mis à jour: ${livre.titre}`);
    return res.status(200).json({ success: true, data: livre });
  } catch (error: any) {
    logger.error(`Erreur mise à jour livre ${req.params.id}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteLivre = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;
    const deleted = await livreService.deleteLivre(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Livre non trouvé' });
    }
    logger.info(`Livre supprimé: ${id}`);
    return res.status(204).send();
  } catch (error: any) {
    logger.error(`Erreur suppression livre ${req.params.id}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};