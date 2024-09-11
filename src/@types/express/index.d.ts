import { JwtPayload } from "../../middlewares";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        id: string,
        role: string
      };
      file?: {
        filename: string;
        path: string;
        orginalname: string;
        mimetype: string;
        size: string
      }
    }
  }
}

export {};


