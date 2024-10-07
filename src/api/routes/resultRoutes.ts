import { Router } from "express";
import { submitQuizResult } from "../controllers/resultController";
import { protect } from "../../middlewares";

const router = Router();

router.post('/submit-quiz', protect, submitQuizResult)

export default router
