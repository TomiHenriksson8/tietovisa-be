import { NextFunction, Request, Response } from "express";
import CustomError from "../../classes/CustomError";
import QuizModel from "../models/quizModel";
import { PopulatedQuiz } from "../../types/quizTypes";
import ResultModel from "../models/resultModel";

export const submitQuizResult = async (
  req: Request<
    {},
    {},
    {
      quizId: string;
      answers: { questionId: string; answerId: string }[];
      timeTaken: number;
    }
  >,
  res: Response,
  next: NextFunction
) => {
  const { quizId, answers, timeTaken } = req.body;
  // const userId = req.user?._id
  const userId = (req as any).user.id;
  try {
    const quiz = (await QuizModel.findById(quizId).populate(
      "questions"
    )) as unknown as PopulatedQuiz;
    if (!quiz) {
      return next(new CustomError("Quiz not found", 404));
    }
    let correctAnswers = 0;
    quiz.questions.forEach((question: any) => {
      const userAnswer = answers.find(
        (a) => a.questionId === question._id.toString()
      );
      const correctAnswer = question.answers.find((a: any) => a.isCorrect);
      if (
        correctAnswer &&
        correctAnswer._id.toString() == userAnswer?.answerId
      ) {
        correctAnswers++;
      }

      const totalQuestions = quiz.questions.length;

      const result = new ResultModel({
        userId,
        quizId,
        correctAnswers,
        totalQuestions,
        completedAt: new Date(),
        timeTaken,
      }).save();

      res.status(201).json({ result });
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
