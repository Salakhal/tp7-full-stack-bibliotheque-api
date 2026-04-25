import Joi from 'joi';

export const createEmpruntSchema = Joi.object({
  livre: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.pattern.base': 'L\'ID du livre doit être un ObjectId MongoDB valide',
      'any.required': 'Le livre est requis'
    }),
  utilisateur: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.pattern.base': 'L\'ID de l\'utilisateur doit être un ObjectId MongoDB valide',
      'any.required': 'L\'utilisateur est requis'
    }),
  dateEmprunt: Joi.date().iso().default(Date.now),
  dateRetourPrevue: Joi.date().iso().greater(Joi.ref('dateEmprunt')).required()
    .messages({
      'date.base': 'La date de retour prévue doit être une date valide',
      'date.greater': 'La date de retour prévue doit être postérieure à la date d\'emprunt',
      'any.required': 'La date de retour prévue est requise'
    })
});

export const retourEmpruntSchema = Joi.object({
  dateRetourEffective: Joi.date().iso().default(Date.now)
});