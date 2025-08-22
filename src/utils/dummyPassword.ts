import { randomBytes } from "crypto";
import { hash } from "bcryptjs";

export async function generateDummyPasswordHash() {
  const randomStr = randomBytes(32).toString("hex");
  return await hash(randomStr, 10);
}
