import { Request, Response } from "express";

export const protectedRoute = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    message: "Access granted to protected route",
    user: req.user, // ✅ Now this works fine
  });
};
