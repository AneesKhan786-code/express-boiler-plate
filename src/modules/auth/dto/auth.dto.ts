import { z } from "zod";

export const registerEntity = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  email: z.string().email({ message: "Valid email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export const loginEntity = z.object({
  email: z.string().email({ message: "Valid email is required" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// export const userSchemaAuth = z.object({
//   name: z.string({message: "name is required"}),
//   email: z.string({message: "email is required"}),
//   password: z.string({message: "password is required"})
// })

// export const userSchemaWithId = userSchemaAuth.extend({
//   id: z.string().uuid(),
//   is_verified: z.string().optional()
// })

export type registerDTO = z.infer<typeof registerEntity>;
export type loginDTO = z.infer<typeof loginEntity>;
// export type userResponseDTO = z.infer<typeof userSchemaWithId>
// export type userAuthDto = z.infer<typeof userSchemaAuth>   // commented code written by sir Ahmad