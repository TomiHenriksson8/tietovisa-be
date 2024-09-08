import { NextFunction, Request, Response } from "express";
import UserModel from "../models/userModel";
import CustomError from "../../classes/CustomError";
import { generateToken } from "../../utils/tokenUtils";
import { User } from "../../types/userTypes";

export const registerUser = async (
  req: Request<{}, {}, { username: string; email: string; password: string; role?: string }>,
  res: Response,
  next: NextFunction
) => {
  const { username, email, password, role = 'user' } = req.body;

  try {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return next(new CustomError('Email already in use', 400));
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
    next(new CustomError((error as Error).message, 500));
  }
};
