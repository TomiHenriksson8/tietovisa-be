import mongoose from "mongoose";

export interface Question {
  _id?: mongoose.Types.ObjectId;
  questionText: string;
  answers: { text: string; isCorrect: boolean }[];
  difficulty?: number;
  date: Date;
}
