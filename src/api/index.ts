import express, { Request, Response } from "express";
import { MessageResponse } from "../types/Messages";
import userRoutes from "./routes/userRoutes";
import quizRoutes from "./routes/quizRoutes";
import questionRoutes from "./routes/questionRoutes"
import resultRoutes from './routes/resultRoutes'

const router = express.Router();

router.get<{}, MessageResponse>("/", (_req: Request, res: Response) => {
  res.json({
    message: "api v1",
  });
});

router.use("/auth", userRoutes);
router.use("/quiz", quizRoutes);
router.use("/result", resultRoutes)
router.use('/questions', questionRoutes)

export default router;
