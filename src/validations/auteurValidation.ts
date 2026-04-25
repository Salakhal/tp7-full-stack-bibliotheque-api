import Joi from 'joi';

export const createAuteurSchema = Joi.object({
  nom: Joi.string().trim().max(50).required()
    .messages({
      'string.base': 'Le nom doit être une chaîne de caractères',
      'string.empty': 'Le nom ne peut pas être vide',
      'string.max': 'Le nom ne peut pas dépasser {#limit} caractères',
      'any.required': 'Le nom est requis'
    }),
  prenom: Joi.string().trim().max(50).required()
    .messages({
      'string.base': 'Le prénom doit être une chaîne de caractères',
      'string.empty': 'Le prénom ne peut pas être vide',
      'string.max': 'Le prénom ne peut pas dépasser {#limit} caractères',
      'any.required': 'Le prénom est requis'
    }),
  dateNaissance: Joi.date().iso().required()
    .messages({
      'date.base': 'La date de naissance doit être une date valide',
      'date.format': 'La date de naissance doit être au format ISO (YYYY-MM-DD)',
      'any.required': 'La date de naissance est requise'
    }),
  dateDeces: Joi.date().iso().greater(Joi.ref('dateNaissance')).allow(null)
    .messages({
      'date.base': 'La date de décès doit être une date valide',
      'date.greater': 'La date de décès doit être postérieure à la date de naissance'
    }),
  biographie: Joi.string().trim().max(2000).allow('', null)
    .messages({
      'string.base': 'La biographie doit être une chaîne de caractères',
      'string.max': 'La biographie ne peut pas dépasser {#limit} caractères'
    }),
  nationalite: Joi.string().trim().max(50).allow('', null)
    .messages({
      'string.base': 'La nationalité doit être une chaîne de caractères',
      'string.max': 'La nationalité ne peut pas dépasser {#limit} caractères'
    }),
  photo: Joi.string().uri().allow('', null)
    .messages({
      'string.uri': 'La photo doit être une URL valide'
    })
});

export const updateAuteurSchema = createAuteurSchema.fork(
  ['nom', 'prenom', 'dateNaissance'],
  (schema) => schema.optional()
);