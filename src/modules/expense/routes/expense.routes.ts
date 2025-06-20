import { Router } from "express";
import { addExpense } from "../controllers/expense.controller";
import { protect } from "@/shared/middleware/auth.middleware";

const expenseRouter = Router();

expenseRouter.post("/add", protect, addExpense);

export { expenseRouter };
