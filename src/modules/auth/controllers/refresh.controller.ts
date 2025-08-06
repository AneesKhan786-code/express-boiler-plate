import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../../../utils/jwt";
import { HttpError } from "@/lib/fn-error";
import { asyncWrapper } from "../../../lib/fn-wrapper";
import { MyJwtPayload } from "@/types/jwt-payload";

export const refresh = asyncWrapper(async (req: Request, res: Response, next: NextFunction) => {
    const oldToken = req.cookies.refreshToken;
    if (!oldToken) return next(new HttpError("No refresh token", 401));

    try {
        const decoded = jwt.verify(oldToken, process.env.REFRESH_TOKEN_SECRET!);

        if (typeof decoded !== "object" || decoded === null) {
            return next(new HttpError("Invalid token payload", 403));
        }

        const user = decoded as MyJwtPayload;

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false,
            path: "/api/refresh",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ accessToken: newAccessToken });
    } catch (err) {
        return next(new HttpError("Invalid refresh token", 403));
    }
});