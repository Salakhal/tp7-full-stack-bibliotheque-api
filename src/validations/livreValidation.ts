import Joi from 'joi';

const genresValides = [
  'Roman', 'Science-Fiction', 'Fantastique', 'Policier', 'Thriller', 
  'Biographie', 'Histoire', 'Philosophie', 'Poésie', 'Théâtre', 
  'Jeunesse', 'BD', 'Manga', 'Art', 'Cuisine', 'Voyage', 'Sport', 
  'Informatique', 'Autre'
];

export const createLivreSchema = Joi.object({
  titre: Joi.string().trim().max(200).required()
    .messages({
      'string.base': 'Le titre doit être une chaîne de caractères',
      'string.empty': 'Le titre ne peut pas être vide',
      'string.max': 'Le titre ne peut pas dépasser {#limit} caractères',
      'any.required': 'Le titre est requis'
    }),
  auteur: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required()
    .messages({
      'string.pattern.base': 'L\'ID de l\'auteur doit être un ObjectId MongoDB valide',
      'any.required': 'L\'auteur est requis'
    }),
  isbn: Joi.string().trim().required()
    .messages({
      'string.empty': 'L\'ISBN est requis',
      'any.required': 'L\'ISBN est requis'
    }),
  anneePublication: Joi.number().integer().min(1450).max(new Date().getFullYear()).required()
    .messages({
      'number.base': 'L\'année de publication doit être un nombre',
      'number.min': 'L\'année de publication doit être supérieure à 1450',
      'number.max': 'L\'année de publication ne peut pas être dans le futur',
      'any.required': 'L\'année de publication est requise'
    }),
  editeur: Joi.string().trim().max(100).allow('', null),
  genre: Joi.array().items(Joi.string().valid(...genresValides)).min(1).required()
    .messages({
      'array.base': 'Les genres doivent être un tableau',
      'array.min': 'Au moins un genre est requis',
      'any.only': 'Genre invalide',
      'any.required': 'Les genres sont requis'
    }),
  resume: Joi.string().trim().max(5000).allow('', null),
  nombrePages: Joi.number().integer().min(1).max(5000).allow(null),
  langue: Joi.string().trim().default('Français'),
  exemplairesTotal: Joi.number().integer().min(1).default(1),
  image: Joi.string().uri().allow('', null)
});

export const updateLivreSchema = createLivreSchema.fork(
  ['titre', 'auteur', 'isbn', 'anneePublication', 'genre'],
  (schema) => schema.optional()
);