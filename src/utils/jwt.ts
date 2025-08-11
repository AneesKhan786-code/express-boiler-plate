import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const accessTokenSecret = process.env.JWT_ACCESS_SECRET!;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;

const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRES_IN || "1d";
const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, accessTokenSecret, {
    expiresIn: accessTokenExpiry as SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, refreshTokenSecret, {
    expiresIn: refreshTokenExpiry as SignOptions["expiresIn"],
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, accessTokenSecret);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, refreshTokenSecret);
};
