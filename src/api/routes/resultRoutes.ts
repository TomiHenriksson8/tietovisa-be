import { Router } from "express";
import {
  compareQuizResult,
  getAllQuizResultsByUserId,
  getQuizResultByQuizId,
  submitQuizResult,
  getAllTimeTopUsers,
  getDailyTopUsers,
  getWeeklyTopUsers,
} from "../controllers/resultController";
import { protect } from "../../middlewares";

const router = Router();

// Leaderboard routes
router.get("/all-time-top", getAllTimeTopUsers);
router.get("/daily-top", getDailyTopUsers);
router.get("/weekly-top", getWeeklyTopUsers);

// Existing result routes
router.get("/all", protect, getAllQuizResultsByUserId);
router.get("/compare/:quizId", protect, compareQuizResult);
router.post("/submit-quiz", protect, submitQuizResult);
router.get("/:quizId", protect, getQuizResultByQuizId);

export default router;
