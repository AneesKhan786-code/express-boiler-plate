import { Router } from "express";
import { signup } from "../controllers/register.controller";
import { refresh } from "../controllers/refresh.controller";
import { protectedRoute } from "../controllers/protected.controller";
import { validator } from "@/shared/middleware/body-validator";
import { registerEntity } from "../dto/auth.dto";
import { protect } from "@/shared/middleware/auth.middleware";
import { login } from "../controllers/login.controller";
import { verifyOtpController } from "../controllers/verifyOtp.controller";
import { verifyOtpSchema } from "../dto/verify.dto";
import { resendOtpController } from "../controllers/resendOtp.controller";
import { verifyLoginOtp } from "../controllers/verifyLoginOtp.controller";

const authRouter = Router();

// Signup Route
// authRouter.post("/signup", validator(registerEntity), signup);

//Verify Otp route
authRouter.post("/verify-otp", validator(verifyOtpSchema),verifyOtpController);

//Resend Otp route 
authRouter.post("/resend-otp", resendOtpController);

// Refresh Token Route
authRouter.get("/refresh", refresh);

// Protected Route (needs access token)
authRouter.get("/protected", protect, protectedRoute);

// login routes
authRouter.post("/login", login);

//
authRouter.post("/verify-login-otp", verifyLoginOtp);


export { authRouter };