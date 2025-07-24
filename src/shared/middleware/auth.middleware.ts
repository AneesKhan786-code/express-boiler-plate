import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { HttpError } from "@/lib/fn-error";
import { MyJwtPayload } from "@/types/jwt-payload";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError("Unauthorized", 401));
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);

    if (typeof decoded !== "object" || decoded === null) {
      return next(new HttpError("Invalid token payload", 403));
    }

    req.user = decoded as MyJwtPayload;
    next();
  } catch {
    return next(new HttpError("Token expired or invalid", 403));
  }
};
