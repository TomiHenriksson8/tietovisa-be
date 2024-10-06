import { NextFunction, Request, Response } from "express";
import CustomError from "../../classes/CustomError";
import { Question } from "../../types/questionTypes";
import QuestionModel from "../models/questionModel";

export const createQuestion = async (
  req: Request<
    {},
    {},
    { questionText: string; date: string; answers: { text: string; isCorrect: boolean }[] }
  >,
  res: Response<Question | { message: string }>,
  next: NextFunction
) => {
  const { questionText, answers, date } = req.body;
  try {
    const question = await new QuestionModel({
      questionText,
      answers,
      date
    }).save();
    res.status(201).json(question);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const getQuestions = async (
  req: Request,
  res: Response<Question[] | { message: string }>,
  next: NextFunction
) => {
  try {
    const questions = await QuestionModel.find();
    res.status(200).json(questions);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const getQuestionById = async (
  req: Request<{ id: string }>,
  res: Response<Question | { message: string }>,
  next: NextFunction
) => {
  try {
    const question = await QuestionModel.findById(req.params.id);
    if (!question) {
      return next(new CustomError("Question not found", 404));
    }
    res.status(200).json(question);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const updateQuestion = async (
  req: Request<
    { id: string },
    {},
    { questionText: string; answers: { text: string; isCorrect: boolean }[] }
  >,
  res: Response<Question | { message: string }>,
  next: NextFunction
) => {
  const { questionText, answers } = req.body;
  try {
    const updatedQuestion = await QuestionModel.findByIdAndUpdate(
      req.params.id,
      { questionText, answers },
      { new: true }
    );
    if (!updatedQuestion) {
      return next(new CustomError("Question not found", 404));
    }
    res.status(200).json(updatedQuestion);
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const deleteQuestion = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string }>,
  next: NextFunction
) => {
  try {
    const question = await QuestionModel.findByIdAndDelete(req.params.id);
    if (!question) {
      return next(new CustomError("Question not found", 404));
    }
    res.status(200).json({ message: "Question Deleted Successfully" });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const getQuestionCount = async (
  req: Request,
  res: Response<{ count: number } | { message: string }>,
  next: NextFunction
) => {
  try {
    const questionCount = await QuestionModel.countDocuments();
    res.status(200).json({ count: questionCount });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
