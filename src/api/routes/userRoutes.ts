import { Router } from "express";
import {
  deleteUserById,
  getUserById,
  getUserByToken,
  getUserCount,
  getUsers,
  loginUser,
  registerUser,
  updateUser,
} from "../controllers/userController";
import { protect, restrictTo } from "../../middlewares";

const router = Router();

/// Admin-only routes
router.get('/count', protect, restrictTo("admin"), getUserCount);
router.get('/', protect, restrictTo("admin"), getUsers);
router.put("/user/:userId", protect, updateUser);
router.delete('/user/:userId', protect, restrictTo("admin"), deleteUserById);

// Authenticated user routes
router.get("/me", protect, getUserByToken);
router.get("/user/:userId", protect, getUserById);

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
