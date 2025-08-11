import { Request, Response, NextFunction } from "express";
import { HttpError } from "@/lib/fn-error";

export const checkRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !roles.includes(user.role)) {
      return next(new HttpError("Access denied", 403));
    }
    next();
  };
};