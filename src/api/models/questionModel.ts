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
  difficulty: { type: Number, default: 5 },
  date: {
    type: Date,
    required: true,
  },
});

questionSchema.index({
  questionText: 'text',
  'answers.text': 'text',
});

// Define and export the QuestionDocument interface
export interface QuestionDocument extends Document, Question {}


const QuestionModel = model<Question>("Question", questionSchema);
export default QuestionModel;
