import { model, Schema } from "mongoose";
import { Result } from "../../types/resultTypes";

const resultSchema = new Schema<Result>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  correctAnswers: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now },
  points: { type: Number, required: true },
});

const ResultModel = model<Result>("Result", resultSchema);
export default ResultModel;
