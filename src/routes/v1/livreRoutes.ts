import express from 'express';
import * as livreController from '../../controllers/livreController';
import { validateRequest } from '../../middlewares/validateRequest';
import { createLivreSchema, updateLivreSchema } from '../../validations/livreValidation';
import { protect, authorize } from '../../middlewares/auth';

const router = express.Router();

router.route('/')
  .get(livreController.getAllLivres)
  .post(
    protect,
    authorize('bibliothecaire', 'admin'),
    validateRequest(createLivreSchema),
    livreController.createLivre
  );

router.route('/:id')
  .get(livreController.getLivreById)
  .put(
    protect,
    authorize('bibliothecaire', 'admin'),
    validateRequest(updateLivreSchema),
    livreController.updateLivre
  )
  .delete(
    protect,
    authorize('admin'),
    livreController.deleteLivre
  );

export default router;