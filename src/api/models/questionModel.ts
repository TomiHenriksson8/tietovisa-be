import { model, Schema } from "mongoose";
import { Question } from "../../types/questionTypes";

const questionSchema = new Schema<Question>({
  questionText: { type: String, required: true },
  answers: [
    {
      text: { type: String, required: true },
      isCorrect: { type: Boolean, required: true },
    },
  ],
  difficulty: { type: String, default: "medium" },
});

const QuestionModel = model<Question>("Question", questionSchema);
export default QuestionModel;
