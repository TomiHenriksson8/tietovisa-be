import mongoose, { Types } from "mongoose";

export interface Result {
  userId: Types.ObjectId;
  quizId: Types.ObjectId;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: Date;
  points: number;
  answers: {
    questionId: Types.ObjectId;
    answerId: Types.ObjectId;
  }[];
}

export interface PopulatedResult extends Omit<Result, 'quizId'> {
  quizId: {
    _id: mongoose.Schema.Types.ObjectId;
    title: string;
  };
}
