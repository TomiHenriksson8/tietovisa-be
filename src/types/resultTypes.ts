import mongoose from "mongoose";

export interface Result {
  userId: mongoose.Schema.Types.ObjectId;
  quizId: mongoose.Schema.Types.ObjectId;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: Date;
}

export interface PopulatedResult extends Omit<Result, 'quizId'> {
  quizId: {
    _id: mongoose.Schema.Types.ObjectId;
    title: string;
  };
}
