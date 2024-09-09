import { Express } from "express";
import request from "supertest";
import crypto from 'crypto'

export const createQuestionTest = (
  app: Express,
  token: string
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const randomString = () => crypto.randomBytes(8).toString("hex");
    request(app)
      .post("/api/v1/questions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        questionText: `tq: ${randomString()}`,
        answers: [
          { text: `ta: ${randomString()}`, isCorrect: true },
          { text: `ta: ${randomString()}`, isCorrect: false },
          { text: `ta: ${randomString()}`, isCorrect: false },
          { text: `ta: ${randomString()}`, isCorrect: false },
        ],
      })
      .expect(201)
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          try {
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty("_id");
            expect(res.body).toHaveProperty("questionText");
            expect(res.body).toHaveProperty("answers");
            expect(Array.isArray(res.body.answers)).toBe(true);
            expect(res.body.answers.length).toBe(4);

            resolve(res.body);
          } catch (assertionError) {
            reject(assertionError);
          }
        }
      });
  });
};

export const getQuestionByIdTest = (app: Express, id: string) => {
  return new Promise((resolve, reject) => {
    request(app)
      .get(`/api/v1/questions/${id}`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty("_id");
          expect(res.body).toHaveProperty("questionText");
          expect(res.body).toHaveProperty("answers");
          expect(Array.isArray(res.body.answers)).toBe(true);
          expect(res.body.answers.length).toBe(4);

          resolve(res.body);
        }
      });
  });
};

export const deleteQuestionByIdTest = (
  app: Express,
  id: string,
  token: string
) => {
  return new Promise((resolve, reject) => {
    request(app)
      .delete(`/api/v1/questions/${id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200)
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty("message");
          expect(res.body.message).toBe("Question Deleted Successfully");
          resolve(res.body);
        }
      });
  });
};
