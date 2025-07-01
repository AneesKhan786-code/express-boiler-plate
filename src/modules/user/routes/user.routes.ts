import { Router } from "express";
import { createUser, getUserJobAndTodayExpense } from "../controllers/user.controller";
import { protect } from "../../../shared/middleware/auth.middleware"; // ✅ JWT middleware

const router = Router();

router.post("/", createUser); // ✅ Signup route
router.get("/job-expense", protect, getUserJobAndTodayExpense); // ✅ Protected route

export default router;
