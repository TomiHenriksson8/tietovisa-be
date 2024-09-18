import { Router } from "express";
import {
  getUserByToken,
  loginUser,
  registerUser,
} from "../controllers/userController";
import { protect } from "../../middlewares";

const router = Router();

router.get("/me", protect, getUserByToken);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
