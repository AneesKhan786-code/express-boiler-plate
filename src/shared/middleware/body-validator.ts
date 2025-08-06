import { HttpError } from "../../lib/fn-error";
import type { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validator =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten();
      return next(new HttpError("Validation Error", 400, errors.fieldErrors));
    }
    req.body = result.data;
    next();
  };