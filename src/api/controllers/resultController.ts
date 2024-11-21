import { NextFunction, Request, Response } from "express";
import CustomError from "../../classes/CustomError";
import QuizModel from "../models/quizModel";
import ResultModel from "../models/resultModel";
import { PopulatedQuiz } from "../../types/quizTypes";
import { PopulatedResult } from "../../types/resultTypes";
import UserModel from "../models/userModel";

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
    console.log("Fetching quiz with ID:", quizId);
    const quiz = (await QuizModel.findById(quizId).populate(
      "questions"
    )) as unknown as PopulatedQuiz;

    if (!quiz) {
      console.error("Quiz not found for ID:", quizId);
      return next(new CustomError("Quiz not found", 404));
    }

    console.log("Quiz loaded. Total questions:", quiz.questions.length);

    // Calculate the number of correct answers
    let correctAnswers = 0;
    quiz.questions.forEach((question: any) => {
      const userAnswer = answers.find(
        (a) => a.questionId === question._id.toString()
      );
      const correctAnswer = question.answers.find((a: any) => a.isCorrect);

      console.log(
        `Question ID: ${question._id}, User Answer: ${userAnswer?.answerId}, Correct Answer: ${correctAnswer?._id}`
      );

      if (
        correctAnswer &&
        correctAnswer._id.toString() === userAnswer?.answerId.toString()
      ) {
        correctAnswers++;
      }
    });

    console.log(
      `User answered ${correctAnswers} questions correctly out of ${quiz.questions.length}.`
    );

    const totalQuestions = quiz.questions.length;

    // Scoring rules
    let points = correctAnswers * 10;
    if (correctAnswers === totalQuestions) {
      points += 20;
    } else if (correctAnswers >= totalQuestions * 0.8) {
      points += 10;
    }

    if (userId) {
      console.log("Checking existing result for user:", userId);
      const existingResult = await ResultModel.findOne({ userId, quizId });

      if (existingResult) {
        console.log(
          "Existing result found. Updating if the new score is better."
        );
        if (correctAnswers > existingResult.correctAnswers) {
          const pointDifference = points - (existingResult.points || 0);
          existingResult.correctAnswers = correctAnswers;
          existingResult.totalQuestions = totalQuestions;
          existingResult.completedAt = new Date();
          existingResult.points = points;
          await existingResult.save();

          console.log("Updating user points by:", pointDifference);
          await UserModel.findByIdAndUpdate(userId, {
            $inc: { points: pointDifference },
          });
        }
      } else {
        console.log("Saving new result for user:", userId);
        const newResult = new ResultModel({
          userId,
          quizId,
          correctAnswers,
          totalQuestions,
          completedAt: new Date(),
          points,
          answers,
        });
        await newResult.save();
        await UserModel.findByIdAndUpdate(userId, { $inc: { points } });
      }
    }

    // Calculate percentage of correct answers for each question
    const questionStats = await Promise.all(
      quiz.questions.map(async (question: any) => {
        console.log(`Fetching answers for question ID: ${question._id}`);

        // Fetch all results where this question was answered
        const allAnswers = await ResultModel.find({
          quizId,
          "answers.questionId": question._id.toString(),
        });

        console.log(
          `Results for question ${question._id}:`,
          allAnswers.map((result) => result.answers)
        );

        // Count how many users got this question correct
        const correctCount = allAnswers.reduce((count, result) => {
          const userAnswer = result.answers.find(
            (a: any) => a.questionId.toString() === question._id.toString()
          );

          const correctAnswer = question.answers.find((a: any) => a.isCorrect);
          const isCorrect =
            userAnswer &&
            correctAnswer &&
            correctAnswer._id.toString() === userAnswer.answerId.toString();

          console.log(
            `Result ID: ${result._id}, User Answer: ${userAnswer?.answerId}, Is Correct: ${isCorrect}`
          );

          return count + (isCorrect ? 1 : 0);
        }, 0);

        console.log(
          `Correct answers for question ${question._id}: ${correctCount}/${allAnswers.length}`
        );

        // Calculate the percentage of users who got this question correct
        const percentage =
          allAnswers.length > 0
            ? Math.round((correctCount / allAnswers.length) * 100)
            : 0;

        console.log(
          `Question ID: ${question._id}, Correct Percentage: ${percentage}`
        );

        return {
          questionId: question._id,
          questionText: question.questionText,
          correctPercentage: percentage,
        };
      })
    );

    // Send the response
    console.log("Final response:", {
      correctAnswers,
      totalQuestions,
      points,
      questionStats,
    });
    res.status(201).json({ correctAnswers, totalQuestions, points, questionStats });
  } catch (error) {
    console.error("Error in submitQuizResult:", error);
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

export const getAllTimeTopUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const topUsers = await UserModel.find()
      .sort({ points: -1 })
      .limit(10)
      .select("username points");

    const formattedUsers = topUsers.map((user) => ({
      username: user.username,
      totalPoints: user.points,
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};


export const getDailyTopUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTopUsers = await ResultModel.aggregate([
      { $match: { completedAt: { $gte: today } } },
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: "$points" },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          username: "$user.username",
          totalPoints: 1,
        },
      },
    ]);

    res.status(200).json(dailyTopUsers);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const getWeeklyTopUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentWeekStart = new Date();
    currentWeekStart.setDate(
      currentWeekStart.getDate() - currentWeekStart.getDay()
    );
    currentWeekStart.setHours(0, 0, 0, 0);

    const weeklyTopUsers = await ResultModel.aggregate([
      { $match: { completedAt: { $gte: currentWeekStart } } },
      {
        $group: {
          _id: "$userId",
          totalPoints: { $sum: "$points" },
        },
      },
      { $sort: { totalPoints: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          username: "$user.username",
          totalPoints: 1,
        },
      },
    ]);

    res.status(200).json(weeklyTopUsers);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
