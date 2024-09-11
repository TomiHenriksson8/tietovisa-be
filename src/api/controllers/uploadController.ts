import { Request, Response, NextFunction } from "express";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import QuestionModel from "../models/questionModel";
import { Question } from "../../types/questionTypes";
import CustomError from "../../classes/CustomError";
import QuizModel from "../models/quizModel";
import { Quiz } from "../../types/quizTypes";

export const uploadCsv = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      return next(new CustomError("No file uploaded", 400));
    }

    console.log("req.file: ", req.file);

    const questionsData: Question[] = [];
    const csvFilePath = path.join(process.cwd(), "uploads", req.file.filename);

    fs.createReadStream(csvFilePath)
      .pipe(csv({ separator: ";" })) // Set semicolon as the CSV separator
      .on("data", (row) => {
        /*
        Object.keys(row).forEach((key) => {
          console.log(`Key: '${key}', Length: ${key.length}`);
        });
        */

        const questionKey = Object.keys(row).find((key) =>
          key.includes("kysymys")
        );
        const questionText = questionKey ? row[questionKey].trim() : undefined;

        const correctAnswerIndex = row["oikea vastaus"]
          ? row["oikea vastaus"].trim()
          : undefined;

        console.log("Parsed row: ", row);
        // console.log('Question Text:', questionText);
        // console.log('Correct Answer:', correctAnswerIndex);

        if (!questionText || !correctAnswerIndex) {
          console.error(
            "Error: missing questionText or correctAnswerIndex in row",
            row
          );
          return;
        }

        const answers = [
          { text: row["1"], isCorrect: correctAnswerIndex === "1" },
          { text: row["2"], isCorrect: correctAnswerIndex === "2" },
          { text: row["3"], isCorrect: correctAnswerIndex === "3" },
          { text: row["4"], isCorrect: correctAnswerIndex === "4" },
        ];

        questionsData.push({ questionText, answers });
      })
      .on("end", async () => {
        // console.log('Question Data: ', questionsData);
        const createdQuestions = await QuestionModel.insertMany(questionsData);

        const questionsIds = createdQuestions.map((questions) => questions._id);

        const quiz: Quiz = await QuizModel.create({
          title: `Quiz for ${new Date().toLocaleDateString()}`,
          questions: questionsIds,
          publishedAt: new Date(),
        });
        res
          .status(201)
          .json({
            message: "Quiz and questions uploaded successfully",
            quiz,
          });
      });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
