import { Router } from "express";
import { createUser, getUserJobAndTodayExpense } from "../controllers/user.controller";
import { protect } from "../../../shared/middleware/auth.middleware"; // JWT middleware
import { sendNoteEmailController } from '../controllers/user.controller';
const router = Router();

router.post("/", createUser); // Signup route
router.get("/job-expense", protect, getUserJobAndTodayExpense); // Protected route
router.post("/send-note", sendNoteEmailController); 

export default router;