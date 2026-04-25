import Livre, { ILivre } from '../models/Livre';
import mongoose from 'mongoose';
import { incrementLivresCount, decrementLivresCount } from './auteurService';

interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  genre?: string;
  disponible?: boolean;
  search?: string;
}

export const createLivre = async (livreData: Partial<ILivre>): Promise<ILivre> => {
  const livre = await Livre.create(livreData);
  await incrementLivresCount(livre.auteur.toString());
  return livre;
};

export const getAllLivres = async (options: QueryOptions = {}): Promise<{ livres: ILivre[], pagination: any }> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (options.genre) filter.genre = options.genre;
  if (options.disponible !== undefined) filter.disponible = options.disponible;
  if (options.search) {
    filter.$or = [
      { titre: { $regex: options.search, $options: 'i' } },
      { resume: { $regex: options.search, $options: 'i' } }
    ];
  }

  let sort: any = { createdAt: -1 };
  if (options.sort) {
    const sortField = options.sort.startsWith('-') ? options.sort.substring(1) : options.sort;
    const sortOrder = options.sort.startsWith('-') ? -1 : 1;
    sort = { [sortField]: sortOrder };
  }

  const [livres, total] = await Promise.all([
    Livre.find(filter).populate('auteur', 'nom prenom').sort(sort).skip(skip).limit(limit),
    Livre.countDocuments(filter)
  ]);

  return {
    livres,
    pagination: { page, limit, totalPages: Math.ceil(total / limit), totalItems: total }
  };
};

export const getLivreById = async (id: string): Promise<ILivre | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Livre.findById(id).populate('auteur', 'nom prenom nationalite');
};

export const updateLivre = async (id: string, livreData: Partial<ILivre>): Promise<ILivre | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Livre.findByIdAndUpdate(id, livreData, { new: true, runValidators: true });
};

export const deleteLivre = async (id: string): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const livre = await Livre.findById(id);
  if (livre && livre.auteur) {
    await decrementLivresCount(livre.auteur.toString());
  }
  const result = await Livre.findByIdAndDelete(id);
  return result !== null;
};