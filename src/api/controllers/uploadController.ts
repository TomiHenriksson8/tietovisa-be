import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import iconv from "iconv-lite";
import QuestionModel from "../models/questionModel";
import QuizModel from "../models/quizModel";
import { Question } from "../../types/questionTypes";
import { Quiz } from "../../types/quizTypes";
import CustomError from "../../classes/CustomError";

export const uploadCsv = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.file) {
      return next(new CustomError("No file uploaded", 400));
    }

    const questionsData: { [date: string]: Question[] } = {};
    const csvFilePath = path.join(process.cwd(), "/uploads", req.file.filename);
    const rawFileData = fs.readFileSync(csvFilePath);
    const fileContent = iconv.decode(rawFileData, "windows-1252");
    const rows = fileContent.split("\n").map((row) => row.trim());
    rows.slice(1).forEach((row, index) => {
      const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Handle commas inside quoted fields
      const isEmptyRow = columns.every((column) => column.trim() === "");
      if (isEmptyRow) {
        console.log(`Skipping empty row ${index + 1}`);
        return;
      }
      if (columns.length < 9) {
        console.error(
          `Skipping row ${index + 1} due to incorrect column count`,
        );
        return;
      }
      const questionText = columns[0]
        ? columns[0].replace(/(^"|"$)/g, "").trim()
        : undefined;
      const correctAnswerIndex = columns[5] ? columns[5].trim() : undefined;
      let date: Date | undefined;

      if (columns[8]) {
        const dateString = columns[8].replace(/(^"|"$)/g, "").trim();
        date = new Date(dateString);

        if (isNaN(date.getTime())) {
          console.error(`Invalid date on row ${index + 1}:`, dateString);
          return;
        }
      }

      if (!questionText || !correctAnswerIndex || !date) {
        console.error(`Skipping row ${index + 1} due to missing data`, columns);
        return;
      }

      const answers = [
        {
          text: columns[1].replace(/(^"|"$)/g, "").trim(),
          isCorrect: correctAnswerIndex === "1",
        },
        {
          text: columns[2].replace(/(^"|"$)/g, "").trim(),
          isCorrect: correctAnswerIndex === "2",
        },
        {
          text: columns[3].replace(/(^"|"$)/g, "").trim(),
          isCorrect: correctAnswerIndex === "3",
        },
        {
          text: columns[4].replace(/(^"|"$)/g, "").trim(),
          isCorrect: correctAnswerIndex === "4",
        },
      ];

      const dateKey = date.toISOString().split("T")[0];
      if (!questionsData[dateKey]) {
        questionsData[dateKey] = [];
      }

      questionsData[dateKey].push({ questionText, answers, date });
    });

    const createdQuizzes = [];

    for (const dateKey in questionsData) {
      const questions = questionsData[dateKey];

      if (questions.length === 10) {
        const createdQuestions = await QuestionModel.insertMany(questions);

        const questionIds = createdQuestions.map((q) => q._id);

        const quiz: Quiz = await QuizModel.create({
          title: `Quiz for ${new Date(dateKey).toLocaleDateString()}`,
          questions: questionIds,
          publishedAt: new Date(dateKey),
        });

        createdQuizzes.push(quiz);
      } else {
        console.error(
          `Date ${dateKey} does not have exactly 10 questions (found ${questions.length})`,
        );
      }
    }

    res.status(201).json({
      message: "Quizzes and questions uploaded successfully",
      quizzes: createdQuizzes,
    });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
