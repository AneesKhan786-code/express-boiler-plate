import { Router } from "express";
import { signup } from "../controllers/register.controller";
import { validator } from "@/shared/middlewares/body-validator";
import { registerEntity } from "../dto/auth.dto";

const authRouter = Router();

authRouter.route("/signup")
.post(validator(registerEntity), signup);

export { authRouter };
