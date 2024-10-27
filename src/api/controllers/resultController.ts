import { NextFunction, Request, Response } from "express";
import CustomError from "../../classes/CustomError";
import QuizModel from "../models/quizModel";
import ResultModel from "../models/resultModel";
import { PopulatedQuiz } from "../../types/quizTypes";
import { PopulatedResult } from "../../types/resultTypes";

export const submitQuizResult = async (
  req: Request<
    {},
    {},
    { quizId: string; answers: { questionId: string; answerId: string }[] }
  >,
  res: Response,
  next: NextFunction
) => {
  const { quizId, answers } = req.body;
  const userId = (req as any).user?.id || null;

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
        correctAnswer._id.toString() === userAnswer?.answerId
      ) {
        correctAnswers++;
      }
    });

    const totalQuestions = quiz.questions.length;
    if (userId) {
      const existingResult = await ResultModel.findOne({ userId, quizId });

      if (existingResult) {
        if (correctAnswers > existingResult.correctAnswers) {
          existingResult.correctAnswers = correctAnswers;
          existingResult.totalQuestions = totalQuestions;
          existingResult.completedAt = new Date();
          await existingResult.save();
          console.log("Result updated with a better score.");
        } else {
          console.log("Existing score is better or equal, not updating.");
        }
      } else {
        const newResult = new ResultModel({
          userId,
          quizId,
          correctAnswers,
          totalQuestions,
          completedAt: new Date(),
        });
        await newResult.save();
        console.log("New result saved.");
      }
    }
    res.status(201).json({ correctAnswers, totalQuestions });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const compareQuizResult = async (
  req: Request<{ quizId: string }, {}, {}>,
  res: Response,
  next: NextFunction
) => {
  const { quizId } = req.params;
  const userId = (req as any).user?.id;

  try {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return next(new CustomError("Quiz not found", 404));
    }

    const allResults = await ResultModel.find({ quizId });
    if (allResults.length === 0) {
      return res
        .status(404)
        .json({ message: "No results found for this quiz" });
    }

    const userResult = await ResultModel.findOne({ userId, quizId });
    if (!userResult) {
      return res
        .status(404)
        .json({ message: "User has not taken this quiz yet." });
    }

    const betterThanCount = allResults.filter(
      (result) => result.correctAnswers < userResult.correctAnswers
    ).length;

    const percentage =
      allResults.length > 1
        ? (betterThanCount / (allResults.length - 1)) * 100
        : 100;

    res.status(200).json({
      correctAnswers: userResult.correctAnswers,
      totalQuestions: userResult.totalQuestions,
      betterThanCount,
      totalUsers: allResults.length,
      percentage,
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const getQuizResultByQuizId = async (
  req: Request<{ quizId: string }, {}, {}, { userId: string }>,
  res: Response,
  next: NextFunction
) => {
  const { quizId } = req.params;
  const { userId } = req.query;


  console.log("Quiz ID:", quizId);
  console.log("User ID:", userId);

  if (!userId) {
    return next(new CustomError("User ID is required", 400));
  }

  try {
    const quiz = await QuizModel.findById(quizId);
    if (!quiz) {
      return next(new CustomError("Quiz not found", 404));
    }

    const userResult = await ResultModel.findOne({ userId, quizId });
    if (!userResult) {
      return res.status(404).json({ message: "User has not taken this quiz yet." });
    }

    res.status(200).json({
      correctAnswers: userResult.correctAnswers,
      totalQuestions: userResult.totalQuestions,
      completedAt: userResult.completedAt,
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const getAllQuizResultsByUserId = async (
  req: Request<{}, {}, {}, { userId: string }>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.query;

  if (!userId) {
    return next(new CustomError("User ID is required", 400));
  }

  try {
    const userResults = await ResultModel.find({ userId }).populate("quizId") as unknown as PopulatedResult[];

    if (userResults.length === 0) {
      return res.status(404).json({ message: "No quiz results found for this user." });
    }

    const formattedResults = userResults.map((result) => ({
      quizId: result.quizId._id,
      quizTitle: result.quizId.title,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
      completedAt: result.completedAt,
    }));

    res.status(200).json(formattedResults);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
