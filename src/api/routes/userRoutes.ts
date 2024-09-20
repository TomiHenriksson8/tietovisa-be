import { Router } from "express";
import {
  getUserByToken,
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/userController";
import { protect } from "../../middlewares";

const router = Router();

router.get("/me", protect, getUserByToken);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.put("/user/:userId", protect, updateUser);

export default router;
