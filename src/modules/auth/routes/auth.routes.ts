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

authRouter.post("/verify-otp", validator(verifyOtpSchema),verifyOtpController);
 
authRouter.post("/resend-otp", resendOtpController);

authRouter.get("/refresh", refresh);

authRouter.get("/protected", protect, protectedRoute);

authRouter.post("/login", login);

authRouter.post("/verify-login-otp", verifyLoginOtp);

export { authRouter };