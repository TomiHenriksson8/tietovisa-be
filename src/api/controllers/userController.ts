import { NextFunction, Request, Response } from "express";
import UserModel from "../models/userModel";
import CustomError from "../../classes/CustomError";
import { generateToken } from "../../utils/tokenUtils";
import { User } from "../../types/userTypes";

export const registerUser = async (
  req: Request<
    {},
    {},
    { username: string; email: string; password: string; role?: string }
  >,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password, role = "user" } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return next(new CustomError("Email already in use", 400));
    }

    const user = new UserModel({ username, email, password, role });
    await user.save();

    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({ user, token });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};

export const loginUser = async (
  req: Request<{}, {}, { email: string; password: string }>,
  res: Response<{ user: User; token: string }>,
  next: NextFunction
) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return next(new CustomError("Invalid email or password", 400));
    }
    const isMatch = user.matchPassword(password);
    if (!isMatch) {
      return next(new CustomError("Invalid email or password", 400));
    }
    const token = generateToken(user._id.toString(), user.role);
    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error during login:", error);
    next(new CustomError((error as Error).message, 500));
  }
};

export const getUserByToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const user = await UserModel.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

export const updateUser = async (
  req: Request<{ userId: string }, {}, { email?: string; password?: string }>,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req.params;
  const { email, password } = req.body;

  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(new CustomError("User not found", 404));
    }
    if (email) {
      const existingUser = await UserModel.findOne({ email });
      if (existingUser && existingUser._id.toString() !== userId) {
        return next(new CustomError("Email already in use", 400));
      }
      user.email = email;
    }
    if (password) {
      user.password = password;
    }
    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    next(new CustomError((error as Error).message, 500));
  }
};
