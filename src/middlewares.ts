import { NextFunction, Request, Response } from "express";
import CustomError from "./classes/CustomError";
import { ErrorResponse } from "./types/Messages";
import jwt from "jsonwebtoken";
import path from "path";
import multer from "multer";

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`🔍 - Not Found - ${req.originalUrl}`, 404);
  next(error);
};

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  const statusCode = err.status !== 200 ? err.status || 500 : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
  });
};

export interface JwtPayload {
  id: string;
  role: string;
}


export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      ) as JwtPayload;
      (req as any).user = { id: decoded.id, role: decoded.role };
      console.log("user decoded from token", decoded);
      next();
    } catch (err) {
      return next(new CustomError("Not authorized, token failed", 401));
    }
  }
  if (!token) {
    return next(new CustomError("Not authorized, no token provided", 401));
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !user.role) {
      return next(
        new CustomError("User is not logged in or role is missing", 401)
      );
    }
    if (!roles.includes(user.role)) {
      return next(
        new CustomError("Access denied, insufficient permissions", 403)
      );
    }
    next();
  };
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    if (ext !== '.csv') {
      (cb as any)(new Error('Only CSV files are allowed'), false);
    } else {
      cb(null, true);
    }
  }
});
