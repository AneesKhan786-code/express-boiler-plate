import { Router } from "express";
import { getUserJobAndTodayExpense , sendNoteEmailController } from "../controllers/user.controller";
import { getCategories , getProductsByCategory } from "@/modules/category/controllers/category.controller";
import { createExpense, getExpenseById, getExpenses, updateExpense, deleteExpense} from "../../expense/controllers/expense.controller";
import { protect } from "../../../shared/middleware/auth.middleware";
import { getMyJob } from "@/modules/jobs/controllers/jobs.controller";

const router = Router();

// Sub-Query
router.get("/job-expense", protect, getUserJobAndTodayExpense);

// Send Mail
router.post("/send-email", sendNoteEmailController);

//  Expense (CRUD)
router.post("/create-expense", protect, createExpense);
router.get("/my-expenses", protect, getExpenses);
router.get("/expense/:id", protect, getExpenseById);
router.put("/update-expense/:id", protect, updateExpense);
router.post("/delete-expense/:id", protect, deleteExpense);

// User/public can only "view"
router.get("/categories", getCategories);
router.get("/categories/products/:id", getProductsByCategory);


// ✅ User Route: See their own job only
router.get("/my-job", protect, getMyJob);

export default router;