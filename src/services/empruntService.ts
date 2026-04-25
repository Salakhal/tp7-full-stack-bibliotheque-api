import Emprunt, { IEmprunt } from '../models/Emprunt';
import Livre from '../models/Livre';
import Utilisateur from '../models/Utilisateur';
import mongoose from 'mongoose';

interface QueryOptions {
  page?: number;
  limit?: number;
  statut?: string;
  utilisateur?: string;
}

export const createEmprunt = async (empruntData: Partial<IEmprunt>): Promise<IEmprunt> => {
  const livre = await Livre.findById(empruntData.livre);
  if (!livre) throw new Error('Livre non trouvé');
  if (livre.exemplairesDisponibles <= 0) throw new Error('Aucun exemplaire disponible');

  const utilisateur = await Utilisateur.findById(empruntData.utilisateur);
  if (!utilisateur) throw new Error('Utilisateur non trouvé');
  if (utilisateur.empruntsEnCours >= 5) throw new Error('Limite de 5 emprunts simultanés atteinte');

  const emprunt = await Emprunt.create(empruntData);
  await Utilisateur.findByIdAndUpdate(emprunt.utilisateur, { $inc: { empruntsEnCours: 1 } });
  return emprunt;
};

export const getAllEmprunts = async (options: QueryOptions = {}): Promise<{ emprunts: IEmprunt[], pagination: any }> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;

  const filter: any = {};
  if (options.statut) filter.statut = options.statut;
  if (options.utilisateur && mongoose.Types.ObjectId.isValid(options.utilisateur)) {
    filter.utilisateur = options.utilisateur;
  }

  const [emprunts, total] = await Promise.all([
    Emprunt.find(filter).populate('livre', 'titre').populate('utilisateur', 'nom prenom email').sort({ dateEmprunt: -1 }).skip(skip).limit(limit),
    Emprunt.countDocuments(filter)
  ]);

  return {
    emprunts,
    pagination: { page, limit, totalPages: Math.ceil(total / limit), totalItems: total }
  };
};

export const getEmpruntById = async (id: string): Promise<IEmprunt | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await Emprunt.findById(id).populate('livre').populate('utilisateur');
};

export const retourEmprunt = async (id: string): Promise<IEmprunt | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const emprunt = await Emprunt.findById(id);
  if (!emprunt) return null;
  if (emprunt.statut === 'rendu') throw new Error('Ce livre a déjà été retourné');

  emprunt.dateRetourEffective = new Date();
  await emprunt.save();

  await Utilisateur.findByIdAndUpdate(emprunt.utilisateur, { $inc: { empruntsEnCours: -1 } });

  return emprunt;
};

export const deleteEmprunt = async (id: string): Promise<boolean> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const emprunt = await Emprunt.findById(id);
  if (emprunt && emprunt.statut !== 'rendu') {
    await Utilisateur.findByIdAndUpdate(emprunt.utilisateur, { $inc: { empruntsEnCours: -1 } });
  }
  const result = await Emprunt.findByIdAndDelete(id);
  return result !== null;
};