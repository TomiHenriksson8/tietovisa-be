import { Router } from "express";
import { compareQuizResult, getAllQuizResultsByUserId, getQuizResultByQuizId, submitQuizResult } from "../controllers/resultController";
import { protect } from "../../middlewares";

const router = Router();

router.get("/all", protect, getAllQuizResultsByUserId);
router.get("/compare/:quizId", protect, compareQuizResult);
router.post('/submit-quiz', protect, submitQuizResult)
router.get("/:quizId", protect, getQuizResultByQuizId);

export default router
