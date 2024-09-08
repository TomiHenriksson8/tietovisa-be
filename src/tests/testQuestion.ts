import { Express } from 'express';
import request from 'supertest';

export const createQuestionTest = (app: Express, token: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    request(app)
      .post('/api/v1/questions')
      .set('Authorization', `Bearer ${token}`)
      .send({
        questionText: "Which element has the chemical symbol 'O'?",
        answers: [
          { text: "Oxygen", isCorrect: true },
          { text: "Gold", isCorrect: false },
          { text: "Silver", isCorrect: false },
          { text: "Hydrogen", isCorrect: false },
        ],
      })
      .expect(201)
      .end((err, res) => {
        if (err) {
          reject(err);
        } else {
          try {
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('questionText');
            expect(res.body).toHaveProperty('answers');
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
