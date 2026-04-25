import express from 'express';
import * as utilisateurController from '../../controllers/utilisateurController';
import { validateRequest } from '../../middlewares/validateRequest';
import { registerUserSchema, loginUserSchema, updateUserSchema } from '../../validations/utilisateurValidation';
import { protect, authorize } from '../../middlewares/auth';

const router = express.Router();

// Routes publiques
router.post('/register', validateRequest(registerUserSchema), utilisateurController.register);
router.post('/login', validateRequest(loginUserSchema), utilisateurController.login);

// Routes protégées
router.get('/me', protect, utilisateurController.getCurrentUser);
router.put('/me', protect, validateRequest(updateUserSchema), utilisateurController.updateProfile);

// Routes admin
router.get('/', protect, authorize('admin'), utilisateurController.getAllUsers);
router.patch('/:id/toggle-status', protect, authorize('admin'), utilisateurController.toggleUserStatus);

export default router;