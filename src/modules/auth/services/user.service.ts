import { db } from "../../../drizzle/db";
import { users } from "../../../drizzle/schema/users";
import { eq } from "drizzle-orm";
import { hash, compare } from "bcryptjs";
import { HttpError } from "@/lib/fn-error";

export const updateUserPasswordById = async (userId: string, newPassword: string) => {
  const hashed = await hash(newPassword, 10);
  await db.update(users).set({ password: hashed }).where(eq(users.id, userId));
};

export const changeUserPassword = async (userId: string, oldPassword: string, newPassword: string) => {
  const rows = await db.select().from(users).where(eq(users.id, userId));
  if (rows.length === 0) {
    throw new HttpError("User not found", 404);
  }

  const user = rows[0];

  if (!user.password) {
    throw new HttpError("This account uses Google login. Password change not allowed.", 400);
  }

  const isMatch = await compare(oldPassword, user.password);
  if (!isMatch) {
    throw new HttpError("Old password is incorrect", 400);
  }

  const hashed = await hash(newPassword, 10);
  await db.update(users).set({ password: hashed }).where(eq(users.id, userId));
};
