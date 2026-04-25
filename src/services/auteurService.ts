import Auteur, { IAuteur } from '../models/Auteur';
import mongoose from 'mongoose';

interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: string;
  nom?: string;
  prenom?: string;
  nationalite?: string;
}

export const createAuteur = async (auteurData: Partial<IAuteur>): Promise<IAuteur> => {
  return await Auteur.create(auteurData);
};

export const getAllAuteurs = async (options: QueryOptions = {}): Promise<{ auteurs: IAuteur[], pagination: any }> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;
  
  const filter: any = {};
  
  if (options.nom) {
    filter.nom = { $regex: options.nom, $options: 'i' };
  }
  
  if (options.prenom) {
    filter.prenom = { $regex: options.prenom, $options: 'i' };
  }
  
  if (options.nationalite) {
    filter.nationalite = { $regex: options.nationalite, $options: 'i' };
  }
  
  let sort: any = { createdAt: -1 };
  if (options.sort) {
    const sortField = options.sort.startsWith('-') ? options.sort.substring(1) : options.sort;
    const sortOrder = options.sort.startsWith('-') ? -1 : 1;
    sort = { [sortField]: sortOrder };
  }
  
  const [auteurs, total] = await Promise.all([
    Auteur.find(filter).sort(sort).skip(skip).limit(limit),
    Auteur.countDocuments(filter)
  ]);
  
  return {
    auteurs,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

export const getAuteurById = async (id: string): Promise<IAuteur | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return await Auteur.findById(id).populate('livres');
};

export const getAuteurByNom = async (nom: string, prenom?: string): Promise<IAuteur | null> => {
  const filter: any = { nom: { $regex: `^${nom}$`, $options: 'i' } };
  if (prenom) {
    filter.prenom = { $regex: `^${prenom}$`, $options: 'i' };
  }
  return await Auteur.findOne(filter);
};

export const updateAuteur = async (id: string, auteurData: Partial<IAuteur>): Promise<IAuteur | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  
  return await Auteur.findByIdAndUpdate(
    id,
    auteurData,
    { new: true, runValidators: true }
  );
};

export const deleteAuteur = async (id: string): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return false;
  }
  
  const result = await Auteur.findByIdAndDelete(id);
  return result !== null;
};

export const incrementLivresCount = async (id: string): Promise<void> => {
  await Auteur.findByIdAndUpdate(id, { $inc: { livresCount: 1 } });
};

export const decrementLivresCount = async (id: string): Promise<void> => {
  await Auteur.findByIdAndUpdate(id, { $inc: { livresCount: -1 } });
};