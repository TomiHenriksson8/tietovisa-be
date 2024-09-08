import { model, Schema } from "mongoose";
import { Quiz } from "../../types/quizTypes";

const quizSchema = new Schema<Quiz>({
  title: { type: String, required: true },
  questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  publishedAt: { type: Date, required: true, default: Date.now },
  isPublished: { type: Boolean, default: false },
});

const QuizModel = model<Quiz>("Quiz", quizSchema);
export default QuizModel;
