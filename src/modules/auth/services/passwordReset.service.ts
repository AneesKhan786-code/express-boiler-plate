import { db } from "../../../drizzle/db";
import { users } from "../../../drizzle/schema/users";
import { eq } from "drizzle-orm";
import redisClient from "@/adapters/redis/redis.adapter";
import { generateOtp, generateOtpExpiry } from "@/utils/otp";
import { sendOtpToEmail } from "@/modules/user/services/mail.service";
import { HttpError } from "@/lib/fn-error";

type ResetPayload = {
  email: string;
  userId: string;
  otp: string;
  otpExpiry: string;
};

const RESET_OTP_KEY = (email: string) => `resetpwd:otp:${email}`;
const RESET_VERIFIED_KEY = (email: string) => `resetpwd:verified:${email}`;

export const findUserByEmailStrict = async (email: string) => {
  const rows = await db.select().from(users).where(eq(users.email, email));
  if (rows.length === 0) throw new HttpError("No account found with this email", 404);
  return rows[0];
};

export const issueResetOtp = async (rawEmail: string) => {
  const email = rawEmail.toLowerCase();
  const user = await findUserByEmailStrict(email);

  const otp = generateOtp();
  const expiryRaw = generateOtpExpiry();
  const otpExpiry =
    expiryRaw instanceof Date ? expiryRaw.toISOString() : String(expiryRaw);

  const payload: ResetPayload = {
    email,
    userId: user.id,
    otp,
    otpExpiry,
  };

  await redisClient.setex(RESET_OTP_KEY(email), 300, JSON.stringify(payload));

  await sendOtpToEmail({ email, name: user.name ?? "User", otp });

  return { email };
};

export const verifyResetOtp = async (rawEmail: string, otp: string) => {
  const email = rawEmail.toLowerCase();

  const str = await redisClient.get(RESET_OTP_KEY(email));
  if (!str) throw new HttpError("Invalid or expired OTP", 400);

  const parsed = JSON.parse(str) as ResetPayload;

  const now = Date.now();
  const exp = new Date(parsed.otpExpiry).getTime();
  if (now > exp) {
    await redisClient.del(RESET_OTP_KEY(email));
    throw new HttpError("OTP expired", 400);
  }

  if (parsed.otp !== otp) throw new HttpError("Invalid OTP", 400);

  await redisClient.del(RESET_OTP_KEY(email));
  await redisClient.setex(
    RESET_VERIFIED_KEY(email),
    600,
    JSON.stringify({ email, userId: parsed.userId })
  );

  return { email };
};

export const assertResetVerified = async (rawEmail: string) => {
  const email = rawEmail.toLowerCase();
  const verified = await redisClient.get(RESET_VERIFIED_KEY(email));
  if (!verified) throw new HttpError("OTP not verified or session expired", 401);
  return JSON.parse(verified) as { email: string; userId: string };
};

export const clearResetVerified = async (rawEmail: string) => {
  const email = rawEmail.toLowerCase();
  await redisClient.del(RESET_VERIFIED_KEY(email));
};
