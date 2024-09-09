import request from "supertest";
import { Express } from "express";
import crypto from "crypto";
import { Quiz } from "../types/quizTypes";

export const getQuizzesTest = (app: Express): Promise<any> => {
  return new Promise((resolve, reject) => {
    request(app)
      .get("/api/v1/quiz")
      .expect(200)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        try {
          expect(res.statusCode).toEqual(200);
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          const quiz = res.body[0];
          expect(quiz).toHaveProperty("_id");
          expect(quiz).toHaveProperty("title");
          expect(quiz).toHaveProperty("questions");
          expect(Array.isArray(quiz.questions)).toBe(true);

          const question = quiz.questions[0];

          expect(question).toHaveProperty("_id");
          expect(question).toHaveProperty("questionText");
          expect(question).toHaveProperty("answers");
          expect(Array.isArray(question.answers)).toBe(true);

          const answer = question.answers[0];
          expect(answer).toHaveProperty("text", "Paris");
          expect(answer).toHaveProperty("isCorrect", true);

          const secondQuestion = quiz.questions[1];
          expect(secondQuestion).toHaveProperty("questionText");
          expect(Array.isArray(secondQuestion.answers)).toBe(true);
          expect(secondQuestion.answers[0]).toHaveProperty("text", "Mars");
          expect(secondQuestion.answers[0]).toHaveProperty("isCorrect", true);

          resolve(res.body);
        } catch (assertionError) {
          reject(assertionError);
        }
      });
  });
};

export const createQuizTest = (
  app: Express,
  token: string,
  questionIds: string[]
): Promise<Quiz> => {
  return new Promise((resolve, reject) => {
    const randomString = () => crypto.randomBytes(8).toString("hex");
    const title = randomString();

    request(app)
      .post("/api/v1/quiz")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title,
        questionIds,
      })
      .expect(201)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        try {
          expect(res.statusCode).toEqual(201);
          expect(Array.isArray(res.body.questions)).toBe(true);
          expect(res.body.questions.length).toEqual(questionIds.length);
          resolve(res.body as Quiz);
        } catch (assertionError) {
          reject(assertionError);
        }
      });
  });
};

export const deleteQuizTest = (app: Express, id: string, token: string) => {
  return new Promise((resolve, reject) => {
    request(app)
      .delete(`/api/v1/quiz/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return reject(err);
        }
        try {
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty("message", "Quiz deleted successfully");
          resolve(res.body);
        } catch (assertionError) {
          reject(assertionError);
        }
      });
  });
};
