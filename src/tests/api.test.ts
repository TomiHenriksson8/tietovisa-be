import mongoose from "mongoose";
import { testInvalidRoute, testServer } from "./testServer";
import app from "../app";
import { loginUser, registerUser } from "./testAuth";
import { getQuizzesTest } from "./testQuiz";
import { createQuestionTest } from "./testQuestion";


let token: string;
const ADMIN_EMAIL = "testi@testi.com";
const ADMIN_PASSWORD = "12345";

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
    const loggedInUser = await loginUser(app, registeredUser.email, registeredUser.password);
    expect(loggedInUser).toHaveProperty("token");
  });

  // Quiz routes
  it("should get all quizzes", async () => {
    await getQuizzesTest(app);
  });

  // question routes
  it("should create a question", async () => {
    await createQuestionTest(app, token);
  });
});
