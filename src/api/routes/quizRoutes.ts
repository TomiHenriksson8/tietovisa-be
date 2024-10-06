import { Router } from 'express';
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizByDate,
  getQuizCount,
  getQuizzesByDateRange, // Import the new controller
} from '../controllers/quizController';
import { protect, restrictTo } from '../../middlewares';

const router = Router();

// Admin-only routes
router.get(
  '/count',
  protect, restrictTo('admin'),
  getQuizCount
);

router.get(
  '/date-range',
  protect, restrictTo('admin'),
  getQuizzesByDateRange
);

// public routes
router.get('/date', getQuizByDate);
router.get('/', getQuizzes);
router.get('/:id', getQuizById);

// Admin-only create, update, and delete routes
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
