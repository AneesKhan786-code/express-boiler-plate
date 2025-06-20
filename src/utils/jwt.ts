import jwt from "jsonwebtoken";
import { MyJwtPayload } from "@/types/jwt-payload"; // ✅ shortcut works only if `paths` set in tsconfig

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export const generateAccessToken = (payload: MyJwtPayload) => {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
};

export const generateRefreshToken = (payload: MyJwtPayload) => {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
};

export const verifyAccessToken = (token: string): MyJwtPayload => {
  return jwt.verify(token, ACCESS_SECRET) as MyJwtPayload;
};

export const verifyRefreshToken = (token: string): MyJwtPayload => {
  return jwt.verify(token, REFRESH_SECRET) as MyJwtPayload;
};
