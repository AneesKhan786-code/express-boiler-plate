import { db } from "../../../drizzle/db";
import { users } from "../../../drizzle/schema/users";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";

export const updateUserPasswordById = async (userId: string, newPassword: string) => {
  const hashed = await hash(newPassword, 10);
  await db.update(users).set({ password: hashed }).where(eq(users.id, userId));
};
