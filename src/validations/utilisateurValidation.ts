import Joi from 'joi';

export const registerUserSchema = Joi.object({
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
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Veuillez fournir un email valide',
      'any.required': 'L\'email est requis'
    }),
  password: Joi.string().min(6).required()
    .messages({
      'string.min': 'Le mot de passe doit contenir au moins {#limit} caractères',
      'any.required': 'Le mot de passe est requis'
    }),
  telephone: Joi.string().pattern(/^(\+33|0)[1-9](\d{2}){4}$/).allow('', null)
    .messages({
      'string.pattern.base': 'Veuillez fournir un numéro de téléphone valide'
    }),
  adresse: Joi.string().max(200).allow('', null)
});

export const loginUserSchema = Joi.object({
  email: Joi.string().email().required()
    .messages({
      'string.email': 'Veuillez fournir un email valide',
      'any.required': 'L\'email est requis'
    }),
  password: Joi.string().required()
    .messages({
      'any.required': 'Le mot de passe est requis'
    })
});

export const updateUserSchema = registerUserSchema.fork(
  ['email', 'password'],
  (schema) => schema.optional()
);