import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller";
import { protect } from "../../../shared/middleware/auth.middleware";

const router = Router();

router.post("/create-expense", protect, createExpense);
router.get("/expenses", protect, getExpenses);
router.get("/expense/:id", protect, getExpenseById);
router.put("/update-expense/:id", protect, updateExpense);
router.post("/delete-expense/:id", protect, deleteExpense);

export default router;