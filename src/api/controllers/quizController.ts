import { NextFunction, Request, Response } from "express";
import QuestionModel from "../models/questionModel";
import CustomError from "../../classes/CustomError";
import QuizModel from "../models/quizModel";

import { PopulatedQuiz, Quiz } from "../../types/quizTypes";

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
    const quiz = QuizModel.findOne({ publishedAt: quizDate }).populate(
      "questions"
    ) as unknown as PopulatedQuiz;
    if (!quiz) {
      return next(new CustomError("Quiz not found the given date", 404));
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
    res.status(200).json({ message: "Quiz deleted sucessfully" });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
