import { Express } from "express";
import request from "supertest";
import crypto from "crypto";
import { User } from "../types/userTypes";

export const registerUser = (
  app: Express
): Promise<{ token: string; email: string; password: string }> => {
  return new Promise((resolve, reject) => {
    const randomString = () => crypto.randomBytes(8).toString("hex");
    const username = `user_${randomString()}`;
    const email = `test_${randomString()}@example.com`;
    const password = randomString();
    request(app)
      .post("/api/v1/auth/register")
      .send({
        username,
        email,
        password,
      })
      .expect(201, (err, res) => {
        if (err) {
          reject(err);
        } else {
          expect(res.statusCode).toEqual(201);
          expect(res.body).toHaveProperty("user");
          expect(res.body).toHaveProperty("token");
          resolve({
            token: res.body.token,
            email,
            password,
          });
        }
      });
  });
};

export const loginUser = (
  app: Express,
  email: string,
  password: string
): Promise<{ token: string; email: string; password: string }> => {
  return new Promise((resolve, reject) => {
    console.log(`Attempting login with email: ${email}, password: ${password}`);
    request(app)
      .post("/api/v1/auth/login")
      .send({
        email,
        password,
      })
      .expect(200)
      .end((err, res) => {
        if (err) {
          console.log("Error in login:", err);
          return reject(err);
        } else {
          expect(res.statusCode).toEqual(200);
          expect(res.body).toHaveProperty("token");
          console.log("Token received:", res.body.token);
          resolve({
            token: res.body.token,
            email,
            password,
          });
        }
      });
  });
};
