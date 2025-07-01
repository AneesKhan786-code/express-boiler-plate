import { Router } from "express";
import { createExpense } from "../controllers/expense.controller";
import { protect } from "../../../shared/middleware/auth.middleware"; // ✅ required

const router = Router();

router.post("/", protect, createExpense); // ✅ secure expense route

export default router;
