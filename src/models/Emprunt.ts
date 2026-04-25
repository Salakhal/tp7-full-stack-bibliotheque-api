import mongoose, { Document, Schema } from 'mongoose';

export interface IEmprunt extends Document {
  livre: mongoose.Types.ObjectId;
  utilisateur: mongoose.Types.ObjectId;
  dateEmprunt: Date;
  dateRetourPrevue: Date;
  dateRetourEffective?: Date;
  statut: 'emprunte' | 'rendu' | 'en_retard';
  penalites?: number;
  createdAt: Date;
  updatedAt: Date;
}

const EmpruntSchema: Schema = new Schema(
  {
    livre: {
      type: Schema.Types.ObjectId,
      ref: 'Livre',
      required: true
    },
    utilisateur: {
      type: Schema.Types.ObjectId,
      ref: 'Utilisateur',
      required: true
    },
    dateEmprunt: {
      type: Date,
      default: Date.now
    },
    dateRetourPrevue: {
      type: Date,
      required: true
    },
    dateRetourEffective: {
      type: Date
    },
    statut: {
      type: String,
      enum: ['emprunte', 'rendu', 'en_retard'],
      default: 'emprunte'
    },
    penalites: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Index
EmpruntSchema.index({ livre: 1 });
EmpruntSchema.index({ utilisateur: 1 });
EmpruntSchema.index({ statut: 1 });

export default mongoose.model<IEmprunt>('Emprunt', EmpruntSchema);