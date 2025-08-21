// src/modules/auth/routes/auth.routes.ts
import { Router } from "express";
import { signup } from "../controllers/register.controller";
import { refresh } from "../controllers/refresh.controller";
import { protectedRoute } from "../controllers/protected.controller";
import { validator } from "../../../shared/middleware/body-validator";
import { registerEntity , loginEntity } from "../dto/auth.dto";
import { protect } from "../../../shared/middleware/auth.middleware";
import { login } from "../controllers/login.controller";
import { verifyOtpController } from "../controllers/verifyOtp.controller";
import { verifyOtpSchema } from "../dto/verify.dto";
import { resendOtpController } from "../controllers/resendOtp.controller";
import { forgotPassword, verifyResetOtpController, resetPassword } from "../controllers/passwordReset.controller";
import { googleLoginController } from "../controllers/google.controller";
import { googleLoginDto } from "../dto/google.dto";

const authRouter = Router();

authRouter.post("/verify-otp", validator(verifyOtpSchema), verifyOtpController);
authRouter.post("/resend-otp", resendOtpController);
authRouter.get("/refresh", refresh);
authRouter.get("/protected", protect, protectedRoute);
authRouter.post("/signup", validator(registerEntity), signup);
authRouter.post("/login", validator(loginEntity), login);
authRouter.post("/google", validator(googleLoginDto), googleLoginController);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/verify-reset-otp", verifyResetOtpController);
authRouter.post("/reset-password", resetPassword);

export { authRouter };



