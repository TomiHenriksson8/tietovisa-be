import { Router } from 'express';
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizByDate,
} from '../controllers/quizController';
import { protect, restrictTo } from '../../middlewares';

const router = Router();

// public routes
router.get('/date', getQuizByDate);
router.get('/', getQuizzes);
router.get('/:id', getQuizById);


// Admin-only routes
router.post(
  '/',
  protect, restrictTo('admin'),
  createQuiz
);
router.put(
  '/:id',
  protect, restrictTo('admin'),
  updateQuiz
);
router.delete(
  '/:id',
  protect, restrictTo('admin'),
  deleteQuiz
);

export default router;
