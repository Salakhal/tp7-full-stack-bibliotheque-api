import { Request, Response } from 'express';
import * as auteurService from '../services/auteurService';
import logger from '../utils/logger';

export const createAuteur = async (req: Request, res: Response) => {
  try {
    const auteur = await auteurService.createAuteur(req.body);
    logger.info(`Auteur créé: ${auteur.nom} ${auteur.prenom}`);
    res.status(201).json({ success: true, data: auteur });
  } catch (error: any) {
    logger.error(`Erreur création auteur: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllAuteurs = async (req: Request, res: Response) => {
  try {
    const options = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 10,
      sort: req.query.sort as string,
      nom: req.query.nom as string,
      prenom: req.query.prenom as string,
      nationalite: req.query.nationalite as string
    };
    const result = await auteurService.getAllAuteurs(options);
    res.status(200).json({ success: true, data: result.auteurs, pagination: result.pagination });
  } catch (error: any) {
    logger.error(`Erreur récupération auteurs: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAuteurById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;
    const auteur = await auteurService.getAuteurById(id);
    if (!auteur) {
      return res.status(404).json({ success: false, error: 'Auteur non trouvé' });
    }
    return res.status(200).json({ success: true, data: auteur });
  } catch (error: any) {
    logger.error(`Erreur récupération auteur ${req.params.id}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateAuteur = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;
    const auteur = await auteurService.updateAuteur(id, req.body);
    if (!auteur) {
      return res.status(404).json({ success: false, error: 'Auteur non trouvé' });
    }
    logger.info(`Auteur mis à jour: ${auteur.nom} ${auteur.prenom}`);
    return res.status(200).json({ success: true, data: auteur });
  } catch (error: any) {
    logger.error(`Erreur mise à jour auteur ${req.params.id}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteAuteur = async (req: Request, res: Response): Promise<Response> => {
  try {
    const id = req.params.id as string;
    const deleted = await auteurService.deleteAuteur(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Auteur non trouvé' });
    }
    logger.info(`Auteur supprimé: ${id}`);
    return res.status(204).send();
  } catch (error: any) {
    logger.error(`Erreur suppression auteur ${req.params.id}: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
};