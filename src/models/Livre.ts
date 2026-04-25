import mongoose, { Document, Schema } from 'mongoose';

export interface ILivre extends Document {
  titre: string;
  auteur: mongoose.Types.ObjectId;
  isbn: string;
  anneePublication: number;
  editeur?: string;
  genre: string[];
  resume?: string;
  nombrePages?: number;
  langue: string;
  disponible: boolean;
  exemplairesTotal: number;
  exemplairesDisponibles: number;
  image?: string;
  noteMoyenne?: number;
  createdAt: Date;
  updatedAt: Date;
}

const LivreSchema: Schema = new Schema(
  {
    titre: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères']
    },
    auteur: {
      type: Schema.Types.ObjectId,
      ref: 'Auteur',
      required: [true, 'L\'auteur est requis']
    },
    isbn: {
      type: String,
      required: [true, 'L\'ISBN est requis'],
      unique: true,
      trim: true,
      match: [/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/, 'Veuillez fournir un ISBN valide']
    },
    anneePublication: {
      type: Number,
      required: [true, 'L\'année de publication est requise'],
      min: [1450, 'L\'année de publication doit être supérieure à 1450'],
      max: [new Date().getFullYear(), 'L\'année de publication ne peut pas être dans le futur']
    },
    editeur: {
      type: String,
      trim: true,
      maxlength: [100, 'L\'éditeur ne peut pas dépasser 100 caractères']
    },
    genre: {
      type: [String],
      required: [true, 'Au moins un genre est requis'],
      enum: {
        values: ['Roman', 'Science-Fiction', 'Fantastique', 'Policier', 'Thriller', 'Biographie', 
                 'Histoire', 'Philosophie', 'Poésie', 'Théâtre', 'Jeunesse', 'BD', 'Manga', 
                 'Art', 'Cuisine', 'Voyage', 'Sport', 'Informatique', 'Autre'],
        message: '{VALUE} n\'est pas un genre valide'
      }
    },
    resume: {
      type: String,
      trim: true,
      maxlength: [5000, 'Le résumé ne peut pas dépasser 5000 caractères']
    },
    nombrePages: {
      type: Number,
      min: [1, 'Le nombre de pages doit être au moins 1'],
      max: [5000, 'Le nombre de pages ne peut pas dépasser 5000']
    },
    langue: {
      type: String,
      default: 'Français',
      trim: true
    },
    disponible: {
      type: Boolean,
      default: true
    },
    exemplairesTotal: {
      type: Number,
      default: 1,
      min: [1, 'Il doit y avoir au moins 1 exemplaire']
    },
    exemplairesDisponibles: {
      type: Number,
      default: 1,
      min: [0, 'Le nombre d\'exemplaires disponibles ne peut pas être négatif']
    },
    image: {
      type: String,
      trim: true
    },
    noteMoyenne: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index pour améliorer les performances des recherches
LivreSchema.index({ titre: 'text', resume: 'text' });
// LivreSchema.index({ isbn: 1 });
LivreSchema.index({ genre: 1 });
LivreSchema.index({ auteur: 1 });
LivreSchema.index({ disponible: 1 });
LivreSchema.index({ noteMoyenne: -1 });

// Virtual populate pour les emprunts
LivreSchema.virtual('emprunts', {
  ref: 'Emprunt',
  localField: '_id',
  foreignField: 'livre',
  justOne: false
});

// Middleware pre-save pour mettre à jour exemplairesDisponibles
LivreSchema.pre('save', function() {
  if (this.isModified('exemplairesTotal')) {
    const oldTotal = this.get('exemplairesTotal') as number;
    const oldDisponibles = this.exemplairesDisponibles as number;
    const newTotal = this.exemplairesTotal as number;
    const difference = newTotal - oldTotal;
    this.exemplairesDisponibles = Math.max(0, oldDisponibles + difference);
  }
  this.disponible = (this.exemplairesDisponibles as number) > 0;
});

export default mongoose.model<ILivre>('Livre', LivreSchema);