import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'API de Bibliothèque',
    version: '1.0.0',
    description: 'API RESTful pour la gestion complète d\'une bibliothèque',
    contact: {
      name: 'Support Technique',
      email: 'support@bibliotheque.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Serveur de développement'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Auteur: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          nom: { type: 'string', example: 'Hugo' },
          prenom: { type: 'string', example: 'Victor' },
          dateNaissance: { type: 'string', format: 'date', example: '1802-02-26' },
          nationalite: { type: 'string', example: 'Française' },
          biographie: { type: 'string' }
        }
      },
      Livre: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          titre: { type: 'string', example: 'Les Misérables' },
          isbn: { type: 'string', example: '978-2-07-040000-0' },
          anneePublication: { type: 'number', example: 1862 },
          genre: { type: 'array', items: { type: 'string' }, example: ['Roman'] },
          disponible: { type: 'boolean', example: true }
        }
      },
      Emprunt: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          livre: { type: 'string' },
          utilisateur: { type: 'string' },
          dateEmprunt: { type: 'string', format: 'date' },
          dateRetourPrevue: { type: 'string', format: 'date' },
          statut: { type: 'string', enum: ['emprunte', 'rendu', 'en_retard'] }
        }
      },
      Utilisateur: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          nom: { type: 'string', example: 'Dupont' },
          prenom: { type: 'string', example: 'Jean' },
          email: { type: 'string', example: 'jean@example.com' },
          role: { type: 'string', enum: ['utilisateur', 'bibliothecaire', 'admin'] },
          estActif: { type: 'boolean', example: true },
          empruntsEnCours: { type: 'number', example: 0 }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['nom', 'prenom', 'email', 'password'],
        properties: {
          nom: { type: 'string', example: 'Dupont' },
          prenom: { type: 'string', example: 'Jean' },
          email: { type: 'string', example: 'jean@example.com' },
          password: { type: 'string', example: 'password123' },
          telephone: { type: 'string', example: '0612345678' },
          adresse: { type: 'string', example: '1 rue de Paris' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'jean@example.com' },
          password: { type: 'string', example: 'password123' }
        }
      },
      LoginResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
          utilisateur: { $ref: '#/components/schemas/Utilisateur' }
        }
      }
    }
  },
  paths: {
    // ==================== AUTHENTIFICATION ====================
    '/utilisateurs/register': {
      post: {
        tags: ['Authentification'],
        summary: 'Créer un compte utilisateur',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterRequest' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Compte créé avec succès',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          '400': { description: 'Données invalides' }
        }
      }
    },
    '/utilisateurs/login': {
      post: {
        tags: ['Authentification'],
        summary: 'Se connecter',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Connexion réussie',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginResponse' }
              }
            }
          },
          '401': { description: 'Email ou mot de passe incorrect' }
        }
      }
    },

    // ==================== UTILISATEURS (Admin) ====================
    '/utilisateurs': {
      get: {
        tags: ['Utilisateurs'],
        summary: 'Liste des utilisateurs (Admin uniquement)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'role', in: 'query', schema: { type: 'string', enum: ['utilisateur', 'bibliothecaire', 'admin'] } },
          { name: 'estActif', in: 'query', schema: { type: 'boolean' } }
        ],
        responses: { '200': { description: 'Liste des utilisateurs' } }
      }
    },
    '/utilisateurs/me': {
      get: {
        tags: ['Utilisateurs'],
        summary: 'Obtenir mon profil',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Profil utilisateur' } }
      },
      put: {
        tags: ['Utilisateurs'],
        summary: 'Mettre à jour mon profil',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nom: { type: 'string' },
                  prenom: { type: 'string' },
                  telephone: { type: 'string' },
                  adresse: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Profil mis à jour' } }
      }
    },
    '/utilisateurs/{id}/toggle-status': {
      patch: {
        tags: ['Utilisateurs'],
        summary: 'Activer/désactiver un utilisateur (Admin uniquement)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Statut modifié' } }
      }
    },

    // ==================== AUTEURS ====================
    '/auteurs': {
      get: {
        tags: ['Auteurs'],
        summary: 'Liste des auteurs',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'sort', in: 'query', schema: { type: 'string', example: '-createdAt' } },
          { name: 'nom', in: 'query', schema: { type: 'string' } },
          { name: 'prenom', in: 'query', schema: { type: 'string' } },
          { name: 'nationalite', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Liste des auteurs' } }
      },
      post: {
        tags: ['Auteurs'],
        summary: 'Ajouter un auteur (Bibliothécaire/Admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['nom', 'prenom', 'dateNaissance'],
                properties: {
                  nom: { type: 'string', example: 'Hugo' },
                  prenom: { type: 'string', example: 'Victor' },
                  dateNaissance: { type: 'string', format: 'date', example: '1802-02-26' },
                  nationalite: { type: 'string', example: 'Française' },
                  biographie: { type: 'string', example: 'Écrivain français...' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Auteur créé' } }
      }
    },
    '/auteurs/{id}': {
      get: {
        tags: ['Auteurs'],
        summary: 'Auteur par ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Détails de l\'auteur' } }
      },
      put: {
        tags: ['Auteurs'],
        summary: 'Modifier un auteur (Bibliothécaire/Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  nom: { type: 'string' },
                  prenom: { type: 'string' },
                  dateNaissance: { type: 'string', format: 'date' },
                  nationalite: { type: 'string' },
                  biographie: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { '200': { description: 'Auteur modifié' } }
      },
      delete: {
        tags: ['Auteurs'],
        summary: 'Supprimer un auteur (Admin uniquement)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Auteur supprimé' } }
      }
    },

    // ==================== LIVRES ====================
    '/livres': {
      get: {
        tags: ['Livres'],
        summary: 'Liste des livres',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'sort', in: 'query', schema: { type: 'string' } },
          { name: 'genre', in: 'query', schema: { type: 'string' } },
          { name: 'disponible', in: 'query', schema: { type: 'boolean' } },
          { name: 'search', in: 'query', schema: { type: 'string', description: 'Recherche par titre/résumé' } }
        ],
        responses: { '200': { description: 'Liste des livres' } }
      },
      post: {
        tags: ['Livres'],
        summary: 'Ajouter un livre (Bibliothécaire/Admin)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['titre', 'auteur', 'isbn', 'anneePublication', 'genre'],
                properties: {
                  titre: { type: 'string', example: 'Les Misérables' },
                  auteur: { type: 'string', example: 'ID_DU_AUTEUR' },
                  isbn: { type: 'string', example: '9782070400000' },
                  anneePublication: { type: 'number', example: 1862 },
                  editeur: { type: 'string', example: 'Gallimard' },
                  genre: { type: 'array', items: { type: 'string' }, example: ['Roman'] },
                  resume: { type: 'string' },
                  nombrePages: { type: 'number', example: 1200 },
                  exemplairesTotal: { type: 'number', example: 3 }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Livre créé' } }
      }
    },
    '/livres/{id}': {
      get: {
        tags: ['Livres'],
        summary: 'Livre par ID',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Détails du livre' } }
      },
      put: {
        tags: ['Livres'],
        summary: 'Modifier un livre (Bibliothécaire/Admin)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Livre modifié' } }
      },
      delete: {
        tags: ['Livres'],
        summary: 'Supprimer un livre (Admin uniquement)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Livre supprimé' } }
      }
    },

    // ==================== EMPRUNTS ====================
    '/emprunts': {
      get: {
        tags: ['Emprunts'],
        summary: 'Liste des emprunts',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'statut', in: 'query', schema: { type: 'string', enum: ['emprunte', 'rendu', 'en_retard'] } },
          { name: 'utilisateur', in: 'query', schema: { type: 'string' } }
        ],
        responses: { '200': { description: 'Liste des emprunts' } }
      },
      post: {
        tags: ['Emprunts'],
        summary: 'Emprunter un livre',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['livre', 'utilisateur', 'dateRetourPrevue'],
                properties: {
                  livre: { type: 'string', example: 'ID_DU_LIVRE' },
                  utilisateur: { type: 'string', example: 'ID_UTILISATEUR' },
                  dateRetourPrevue: { type: 'string', format: 'date', example: '2026-05-18' }
                }
              }
            }
          }
        },
        responses: { '201': { description: 'Emprunt créé' } }
      }
    },
    '/emprunts/{id}': {
      get: {
        tags: ['Emprunts'],
        summary: 'Emprunt par ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Détails de l\'emprunt' } }
      }
    },
    '/emprunts/{id}/retour': {
      patch: {
        tags: ['Emprunts'],
        summary: 'Retourner un livre',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Livre retourné' } }
      }
    }
  }
};

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'API Bibliothèque - Documentation'
  }));
  
  console.log('📚 Documentation Swagger disponible sur /api-docs');
};