import { Router } from "express";
import { compareQuizResult, submitQuizResult } from "../controllers/resultController";
import { protect } from "../../middlewares";

const router = Router();

router.get("/compare/:quizId", protect, compareQuizResult);
router.post('/submit-quiz', protect, submitQuizResult)

export default router
