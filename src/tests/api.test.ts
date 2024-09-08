import mongoose from "mongoose";
import { testInvalidRoute, testServer } from "./testServer";
import app from "../app";
import crypto from "crypto";
import { loginUser, registerUser } from "./testAuth";
import { getQuizzesTest } from "./testQuiz";
import { createQuestionTest } from "./testQuestion";

let token: string;

describe("GET /api/v1", () => {
  beforeAll(async () => {
    if (!process.env.MONGO_TEST_URI) {
      throw new Error("TEST_URL is not defined");
    }
    await mongoose.connect(process.env.MONGO_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("server root should return 200", async () => {
    await testServer(app);
  });

  it("invalid route should return 404", async () => {
    await testInvalidRoute(app, "/api/v1/invalid");
  });

  // test auth routes
  it("should register a new user and login successfully", async () => {
    const registeredUser = await registerUser(app);
    let email = registeredUser.email;
    let password = registeredUser.password;
    const loggedInUser = await loginUser(app, email, password);
    token = loggedInUser.token;
  });

  // quiz routes
  it("should get all quizzes", async () => {
    await getQuizzesTest(app);
  });
});


// test question routes
it("should create a question", async () => {
  const EMAIL = 'testi@admin'
  const PASSWORD = '12345'
  const adminUser = await loginUser(app, EMAIL, PASSWORD )
  await createQuestionTest(app, adminUser.token)
})
