import mongoose from "mongoose";
import { testInvalidRoute, testServer } from "./testServer";
import app from "../app";
import { loginUser, registerUser } from "./testAuth";
import { createQuizTest, deleteQuizTest, getQuizzesTest } from "./testQuiz";
import {
  createQuestionTest,
  deleteQuestionByIdTest,
  getQuestionByIdTest,
} from "./testQuestion";

let token: string;
const ADMIN_EMAIL = process.env.TEST_DB_ADMIN_EMAIL as string;
const ADMIN_PASSWORD = process.env.TEST_DB_ADMIN_PASSWORD as string;

describe("GET /api/v1", () => {
  beforeAll(async () => {
    if (!process.env.MONGO_TEST_URI) {
      throw new Error("TEST_URL is not defined");
    }
    await mongoose.connect(process.env.MONGO_TEST_URI);

    const adminUser = await loginUser(app, ADMIN_EMAIL, ADMIN_PASSWORD);
    token = adminUser.token;
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

  // Test auth routes
  it("should register a new user and login successfully", async () => {
    const registeredUser = await registerUser(app);
    console.log("registered user wtf", registerUser)
    const loggedInUser = await loginUser(
      app,
      registeredUser.email,
      registeredUser.password
    );
    expect(loggedInUser).toHaveProperty("token");
  });

  // Quiz routes
  it("should get all quizzes", async () => {
    await getQuizzesTest(app);
  });

  it("should create questions and add it to quiz and delete it", async () => {
    const question1 = await createQuestionTest(app, token);
    const question2 = await createQuestionTest(app, token);
    const quesdtionIds = [question1._id, question2._id];
    const quiz = await createQuizTest(app, token, quesdtionIds)
    await deleteQuizTest(app, quiz._id ,token)
  });

  // question routes
  it("should create a question and get the same question by id and after that delete it", async () => {
    const question = await createQuestionTest(app, token);
    await getQuestionByIdTest(app, question._id);
    await deleteQuestionByIdTest(app, question._id, token);
  });
});
