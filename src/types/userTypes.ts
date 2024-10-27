import mongoose, { Document } from "mongoose";

export interface User extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  role: string;
  email: string;
  password: string;
  points: number,
  matchPassword(enteredPassword: string): Promise<boolean>
}
