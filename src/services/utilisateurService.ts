import Utilisateur, { IUtilisateur } from '../models/Utilisateur';
import mongoose from 'mongoose';

interface QueryOptions {
  page?: number;
  limit?: number;
  role?: string;
  estActif?: boolean;
}

export const register = async (userData: Partial<IUtilisateur>): Promise<{ utilisateur: IUtilisateur, token: string }> => {
  const existingUser = await Utilisateur.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('Cet email est déjà utilisé');
  }
  
  const utilisateur = await Utilisateur.create(userData);
  const token = utilisateur.generateAuthToken();
  
  return { utilisateur, token };
};

export const login = async (email: string, password: string): Promise<{ utilisateur: IUtilisateur, token: string }> => {
  const utilisateur = await Utilisateur.findOne({ email }).select('+password');
  
  if (!utilisateur) {
    throw new Error('Email ou mot de passe incorrect');
  }
  
  if (!utilisateur.estActif) {
    throw new Error('Compte désactivé. Veuillez contacter l\'administrateur');
  }
  
  const isPasswordMatch = await utilisateur.comparePassword(password);
  if (!isPasswordMatch) {
    throw new Error('Email ou mot de passe incorrect');
  }
  
  const token = utilisateur.generateAuthToken();
  
  return { utilisateur, token };
};

export const getUserById = async (id: string): Promise<IUtilisateur | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  return await Utilisateur.findById(id);
};

export const updateUser = async (id: string, userData: Partial<IUtilisateur>): Promise<IUtilisateur | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  
  if (userData.email) {
    const existingUser = await Utilisateur.findOne({ email: userData.email, _id: { $ne: id } });
    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }
  }
  
  return await Utilisateur.findByIdAndUpdate(
    id,
    userData,
    { new: true, runValidators: true }
  );
};

export const getAllUsers = async (options: QueryOptions = {}): Promise<{ utilisateurs: IUtilisateur[], pagination: any }> => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 10));
  const skip = (page - 1) * limit;
  
  const filter: any = {};
  if (options.role) filter.role = options.role;
  if (options.estActif !== undefined) filter.estActif = options.estActif;
  
  const [utilisateurs, total] = await Promise.all([
    Utilisateur.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Utilisateur.countDocuments(filter)
  ]);
  
  return {
    utilisateurs,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    }
  };
};

export const toggleUserStatus = async (id: string): Promise<IUtilisateur | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }
  
  const utilisateur = await Utilisateur.findById(id);
  if (!utilisateur) return null;
  
  utilisateur.estActif = !utilisateur.estActif;
  await utilisateur.save();
  
  return utilisateur;
};

export const incrementEmprunts = async (id: string): Promise<void> => {
  await Utilisateur.findByIdAndUpdate(id, { $inc: { empruntsEnCours: 1 } });
};

export const decrementEmprunts = async (id: string): Promise<void> => {
  await Utilisateur.findByIdAndUpdate(id, { $inc: { empruntsEnCours: -1 } });
};

export const addPenalites = async (id: string, montant: number): Promise<void> => {
  await Utilisateur.findByIdAndUpdate(id, { $inc: { penalitesTotal: montant } });
};