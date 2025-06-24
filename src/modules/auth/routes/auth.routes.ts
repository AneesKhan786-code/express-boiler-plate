import { Router } from "express";
import { signup } from "../controllers/register.controller";
import { refresh } from "../controllers/refresh.controller";
import { protectedRoute } from "../controllers/protected.controller";
import { validator } from "@/shared/middleware/body-validator";
import { registerEntity } from "../dto/auth.dto";
import { protect } from "@/shared/middleware/auth.middleware";
import { login } from "../controllers/login.controller";

const authRouter = Router();

// Signup Route
authRouter.post("/signup", validator(registerEntity), signup);

// Refresh Token Route
authRouter.get("/refresh", refresh);

// Protected Route (needs access token)
authRouter.get("/protected", protect, protectedRoute);

// login routes
authRouter.post("/login", login);

export { authRouter };
