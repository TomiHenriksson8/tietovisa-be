import { NextFunction, Request, Response } from "express";
import QuestionModel, { QuestionDocument } from "../models/questionModel";
import CustomError from "../../classes/CustomError";
import QuizModel from "../models/quizModel";

import { PopulatedQuiz, Quiz } from "../../types/quizTypes";
import { FilterQuery } from "mongoose";
import { Question } from "../../types/questionTypes";

export const createQuiz = async (
  req: Request<{}, {}, { title: string; questionIds: string[] }>,
  res: Response<Quiz>,
  next: NextFunction
) => {
  const { title, questionIds } = req.body;
  try {
    const questions = await QuestionModel.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      return next(new CustomError("Some questions were not found", 400));
    }
    const quiz = await new QuizModel({ title, questions: questionIds }).save();
    res.status(201).json(quiz);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const addQuestionToQuiz = async (
  req: Request<{ quizId: string }>,
  res: Response<{ message: string }>,
  next: NextFunction
) => {
  const { quizId } = req.params;
  const { questionId } = req.body;

  try {
    // Fetch the quiz
    const quiz = await QuizModel.findById(quizId);

    if (!quiz) {
      return next(new CustomError("Quiz not found", 404));
    }

    // Ensure the question exists
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      return next(new CustomError("Question not found", 404));
    }

    // Check if `questions` array exists and if the question is already included
    if (quiz.questions && quiz.questions.includes(questionId)) {
      return next(new CustomError("Question is already part of the quiz", 400));
    }

    // Add the question to the quiz
    quiz.questions.push(questionId);
    await quiz.save();

    res.status(200).json({ message: "Question added to the quiz successfully" });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const getQuizzes = async (
  req: Request,
  res: Response<PopulatedQuiz[]>,
  next: NextFunction
) => {
  try {
    const quizzes = (await QuizModel.find().populate(
      "questions"
    )) as unknown as PopulatedQuiz[];
    res.status(200).json(quizzes);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const getQuizById = async (
  req: Request<{ id: string }>,
  res: Response<PopulatedQuiz>,
  next: NextFunction
) => {
  const { id } = req.params;
  try {
    const quiz = (await QuizModel.findById(id).populate(
      "questions"
    )) as unknown as PopulatedQuiz;
    if (!quiz) {
      return next(new CustomError("Quiz not found", 404));
    }
    res.status(200).json(quiz);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const getQuizByDate = async (
  req: Request<{}, {}, {}, { date: string }>,
  res: Response<PopulatedQuiz>,
  next: NextFunction
) => {
  const { date } = req.query;
  try {
    const quizDate = new Date(date);
    const startOfDay = new Date(quizDate.setUTCHours(0, 0, 0, 0));
    const endOfDay = new Date(quizDate.setUTCHours(23, 59, 59, 999));

    const quiz = (await QuizModel.findOne({
      publishedAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("questions")
      .lean()) as unknown as PopulatedQuiz;

    if (!quiz) {
      return next(new CustomError("Quiz not found for the given date", 404));
    }

    res.status(200).json(quiz);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const updateQuiz = async (
  req: Request<{ id: string }, {}, { title: string; questionIds: string[] }>,
  res: Response<PopulatedQuiz>,
  next: NextFunction
) => {
  const { title, questionIds } = req.body;
  try {
    const questions = await QuestionModel.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      return next(new CustomError("Some questions were not found", 400));
    }
    const quiz = (await QuizModel.findByIdAndUpdate(
      req.params.id,
      { title, questions: questionIds },
      { new: true }
    ).populate("questions")) as unknown as PopulatedQuiz;
    if (!quiz) {
      return next(new CustomError("Quiz not found", 404));
    }
    res.status(200).json(quiz);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const deleteQuiz = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string }>,
  next: NextFunction
) => {
  try {
    const quiz = await QuizModel.findByIdAndDelete(req.params.id);
    if (!quiz) {
      return next(new CustomError("Quiz not found", 404));
    }
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const searchQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let searchTerm = "";
    if (typeof req.query.q === "string") {
      searchTerm = req.query.q;
    } else if (
      Array.isArray(req.query.q) &&
      typeof req.query.q[0] === "string"
    ) {
      searchTerm = req.query.q[0];
    }

    let page = 1;
    if (typeof req.query.page === "string") {
      const parsedPage = parseInt(req.query.page, 10);
      if (!isNaN(parsedPage) && parsedPage > 0) {
        page = parsedPage;
      }
    }

    let limit = 50;
    if (typeof req.query.limit === "string") {
      const parsedLimit = parseInt(req.query.limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit > 0) {
        limit = parsedLimit;
      }
    }
    const filter: FilterQuery<QuestionDocument> = searchTerm
      ? { questionText: { $regex: searchTerm, $options: "i" } }
      : {};

    const totalQuestions = await QuestionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalQuestions / limit);
    const questions = await QuestionModel.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ dateAdded: -1 });

    res.json({
      totalQuestions,
      totalPages,
      currentPage: page,
      questions,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizCount = async (
  req: Request,
  res: Response<{ count: number } | { message: string }>,
  next: NextFunction
) => {
  try {
    const quizCount = await QuizModel.countDocuments();
    res.status(200).json({ count: quizCount });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const getQuizzesByDateRange = async (
  req: Request<{}, {}, {}, { startDate: string; endDate: string }>,
  res: Response<PopulatedQuiz[] | { message: string }>,
  next: NextFunction
) => {
  const { startDate, endDate } = req.query;
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return next(new CustomError("Invalid date format", 400));
    }
    const quizzes = (await QuizModel.find({
      publishedAt: {
        $gte: start,
        $lte: end,
      },
    }).populate("questions")) as unknown as PopulatedQuiz[];

    if (quizzes.length === 0) {
      return next(
        new CustomError("No quizzes found for the specified date range", 404)
      );
    }

    res.status(200).json(quizzes);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
