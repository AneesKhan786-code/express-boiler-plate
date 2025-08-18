import { Router } from "express";
import {
  getUserJobAndTodayExpense,
} from "../controllers/user.controller";
import {
  getCategories,
  getProductsByCategory,
} from "@/modules/category/controllers/category.controller";
import {
  createExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
  deleteExpense,
} from "../../expense/controllers/expense.controller";
import { protect } from "../../../shared/middleware/auth.middleware";
import { checkRole } from "@/shared/middleware/rbac.middleware";
import { getMyJob } from "@/modules/jobs/controllers/jobs.controller";

const router = Router();

router.use(protect, checkRole("user"));

router.get("/categories", getCategories);
router.get("/categories/products/:id", getProductsByCategory);

router.get("/job-expense", getUserJobAndTodayExpense);//Sub-Query

router.post("/create-expense", createExpense);
router.get("/my-expenses", getExpenses);
router.get("/expense/:id", getExpenseById);
router.put("/update-expense/:id", updateExpense);
router.post("/delete-expense/:id", deleteExpense);

router.get("/my-job", getMyJob);



export default router;
