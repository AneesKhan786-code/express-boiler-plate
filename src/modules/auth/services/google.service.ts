// src/modules/auth/services/google.service.ts
import { db } from "../../../drizzle/db";
import { users } from "../../../drizzle/schema/users";
import { generateDummyPasswordHash } from "../../../utils/dummyPassword";

export interface GoogleProfile {
  googleId: string;
  email: string;
  name: string;
  verified: boolean;
}

export async function findOrCreateGoogleUser(profile: GoogleProfile) {
  // check if already exists (google sos)
  const existing = await db.query.users.findFirst({
    where: (u, { eq, and }) => and(eq(u.email, profile.email), eq(u.sos, "google")),
  });

  if (existing) return existing;

  const dummyHash = await generateDummyPasswordHash();

  const [inserted] = await db.insert(users).values({
    name: profile.name,
    email: profile.email,
    googleId: profile.googleId,
    password: dummyHash,
    verified: profile.verified,
    role: "user",
    sos: "google",
  }).returning();

  return inserted;
}
