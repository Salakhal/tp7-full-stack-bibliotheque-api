import express from 'express';
import * as auteurController from '../../controllers/auteurController';
import { validateRequest } from '../../middlewares/validateRequest';
import { createAuteurSchema, updateAuteurSchema } from '../../validations/auteurValidation';
import { protect, authorize } from '../../middlewares/auth';

const router = express.Router();

router.route('/')
  .get(auteurController.getAllAuteurs)
  .post(
    protect,
    authorize('bibliothecaire', 'admin'),
    validateRequest(createAuteurSchema),
    auteurController.createAuteur
  );

router.route('/:id')
  .get(auteurController.getAuteurById)
  .put(
    protect,
    authorize('bibliothecaire', 'admin'),
    validateRequest(updateAuteurSchema),
    auteurController.updateAuteur
  )
  .delete(
    protect,
    authorize('admin'),
    auteurController.deleteAuteur
  );

export default router;