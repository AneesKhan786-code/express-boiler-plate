// src/modules/auth/services/google.service.ts
import { db } from "../../../drizzle/db";
import { users } from "../../../drizzle/schema/users";
import { eq, and, isNull } from "drizzle-orm";

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
}

export async function findOrCreateOrLinkGoogleUser(profile: GoogleProfile) {
  const byEmail = await db.select().from(users).where(eq(users.email, profile.email));

  if (byEmail.length > 0) {
    const u = byEmail[0];

    // Already linked
    if (u.googleId) return u;

    // Link existing password-user to Google
    const updated = await db
      .update(users)
      .set({ googleId: profile.googleId, verified: true })
      .where(and(eq(users.id, u.id), isNull(users.googleId)))
      .returning();

    return updated[0];
  }

  // Create new Google user
  const inserted = await db
    .insert(users)
    .values({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      verified: true,
      role: "user",
    })
    .returning();

  return inserted[0];
}
