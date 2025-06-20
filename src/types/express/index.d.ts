import { MyJwtPayload } from "../jwt-payload";

declare global {
  namespace Express {
    interface Request {
      user?: MyJwtPayload;
    }
  }
}

export {};
