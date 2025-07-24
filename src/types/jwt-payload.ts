import { JwtPayload } from "jsonwebtoken";

export interface MyJwtPayload {
  id: number;
  email: string;
  role: string; 
}