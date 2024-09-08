import { Router } from 'express';
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from '../controllers/questionController';
import { protect, restrictTo } from '../../middlewares';

const router = Router();

// Public routes
router.get('/', getQuestions);
router.get('/:id', getQuestionById);

// Admin-only routes
router.post(
  '/',
  protect, restrictTo('admin'),
  createQuestion
);
router.put(
  '/:id',
  protect, restrictTo('admin'),
  updateQuestion
);
router.delete(
  '/:id',
  protect, restrictTo('admin'),
  deleteQuestion
);

export default router;
