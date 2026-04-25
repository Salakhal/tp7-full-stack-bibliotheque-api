import express from 'express';
import auteurRoutes from './auteurRoutes';
import livreRoutes from './livreRoutes';
import empruntRoutes from './empruntRoutes';
import utilisateurRoutes from './utilisateurRoutes';

const router = express.Router();

// Routes par ressource
router.use('/auteurs', auteurRoutes);
router.use('/livres', livreRoutes);
router.use('/emprunts', empruntRoutes);
router.use('/utilisateurs', utilisateurRoutes);

export default router;