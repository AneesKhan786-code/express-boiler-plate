// import {db} from "../../../../drizzle/db"

// import { loginDTO, userResponseDTO } from "../dto/auth.dto"

// import * as schema from "../../../../drizzle/index"
// import { and, eq } from "drizzle-orm";


// export class AuthService {
//     async loginUser <K extends keyof userResponseDTO>(
//         email: string,
//         columns: Pick<typeof schema.users, K>
//     ) {
//         try {
//             const {users} = schema;
//             const result = await db.select(columns).from(users).where(and(and(eq(users.email, email))))
//             return result
//         } catch (error) {
//             throw new Error("something went wrong")
//         }
//     }
// }