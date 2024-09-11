import { Router } from "express";
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController";
import { protect, restrictTo, upload } from "../../middlewares";
import { uploadCsv } from "../controllers/uploadController";

const router = Router();

// Public routes
router.get("/", getQuestions);
router.get("/:id", getQuestionById);

// Admin-only routes
router.post("/", protect, restrictTo("admin"), createQuestion);
router.post("/upload-questions", protect, restrictTo("admin"), upload.single('file'), uploadCsv);
router.put("/:id", protect, restrictTo("admin"), updateQuestion);
router.delete("/:id", protect, restrictTo("admin"), deleteQuestion);

export default router;
