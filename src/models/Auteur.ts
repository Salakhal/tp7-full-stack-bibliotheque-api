import mongoose, { Document, Schema } from 'mongoose';

export interface IAuteur extends Document {
  nom: string;
  prenom: string;
  dateNaissance: Date;
  dateDeces?: Date;
  biographie?: string;
  nationalite?: string;
  photo?: string;
  livresCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AuteurSchema: Schema = new Schema(
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
    dateNaissance: {
      type: Date,
      required: [true, 'La date de naissance est requise']
    },
    dateDeces: {
      type: Date,
      validate: {
        validator: function(this: any, value: Date) {
          return !value || value > this.dateNaissance;
        },
        message: 'La date de décès doit être postérieure à la date de naissance'
      }
    },
    biographie: {
      type: String,
      trim: true,
      maxlength: [2000, 'La biographie ne peut pas dépasser 2000 caractères']
    },
    nationalite: {
      type: String,
      trim: true,
      maxlength: [50, 'La nationalité ne peut pas dépasser 50 caractères']
    },
    photo: {
      type: String,
      trim: true
    },
    livresCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

AuteurSchema.index({ nom: 1, prenom: 1 });
AuteurSchema.index({ nationalite: 1 });
AuteurSchema.index({ dateNaissance: 1 });

AuteurSchema.virtual('livres', {
  ref: 'Livre',
  localField: '_id',
  foreignField: 'auteur',
  justOne: false
});

// Middleware pour la suppression - version corrigée sans next()
AuteurSchema.pre('findOneAndDelete', async function() {
  const auteurId = this.getFilter()._id;
  if (auteurId) {
    const Livre = mongoose.model('Livre');
    await Livre.updateMany({ auteur: auteurId }, { auteur: null });
  }
});

export default mongoose.model<IAuteur>('Auteur', AuteurSchema);