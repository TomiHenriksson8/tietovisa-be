import { Router } from "express";
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getQuestionCount,
} from "../controllers/questionController";
import { protect, restrictTo, upload } from "../../middlewares";
import { uploadCsv } from "../controllers/uploadController";
import { searchQuestions } from "../controllers/quizController";

const router = Router();

// Public routes
router.get("/", getQuestions);

// Admin-only routes
router.get("/search", protect, restrictTo("admin"), searchQuestions);
router.get("/count", protect, restrictTo("admin"), getQuestionCount);
router.post("/", protect, restrictTo("admin"), createQuestion);
router.post(
  "/upload-questions",
  protect,
  restrictTo("admin"),
  upload.single("file"),
  uploadCsv
);
router.put("/:id", protect, restrictTo("admin"), updateQuestion);
router.delete("/:id", protect, restrictTo("admin"), deleteQuestion);

router.get("/:id", getQuestionById);

export default router;
