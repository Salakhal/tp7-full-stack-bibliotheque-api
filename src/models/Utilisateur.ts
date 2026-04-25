import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUtilisateur extends Document {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  role: 'utilisateur' | 'bibliothecaire' | 'admin';
  telephone?: string;
  adresse?: string;
  dateInscription: Date;
  estActif: boolean;
  empruntsEnCours: number;
  penalitesTotal: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

const UtilisateurSchema: Schema = new Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    prenom: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
      maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false
    },
    role: {
      type: String,
      enum: {
        values: ['utilisateur', 'bibliothecaire', 'admin'],
        message: '{VALUE} n\'est pas un rôle valide'
      },
      default: 'utilisateur'
    },
    telephone: {
      type: String,
      trim: true,
      match: [/^(\+33|0)[1-9](\d{2}){4}$/, 'Veuillez fournir un numéro de téléphone valide']
    },
    adresse: {
      type: String,
      trim: true,
      maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
    },
    dateInscription: {
      type: Date,
      default: Date.now
    },
    estActif: {
      type: Boolean,
      default: true
    },
    empruntsEnCours: {
      type: Number,
      default: 0,
      max: [5, 'Maximum 5 emprunts simultanés']
    },
    penalitesTotal: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

// Index pour améliorer les performances des recherches
// UtilisateurSchema.index({ email: 1 });
UtilisateurSchema.index({ nom: 1, prenom: 1 });
UtilisateurSchema.index({ estActif: 1 });

// Middleware pre-save pour hacher le mot de passe
UtilisateurSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '10'));
  const passwordToHash = this.password as string;
  this.password = await bcrypt.hash(passwordToHash, salt);
});

// Méthode pour comparer les mots de passe
UtilisateurSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour générer un token JWT
UtilisateurSchema.methods.generateAuthToken = function(): string {
  const payload = { id: this._id, email: this.email, role: this.role };
  const secret = process.env.JWT_SECRET as string;
  const expiresIn = process.env.JWT_EXPIRE || '30d';
  
  return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
};

export default mongoose.model<IUtilisateur>('Utilisateur', UtilisateurSchema);