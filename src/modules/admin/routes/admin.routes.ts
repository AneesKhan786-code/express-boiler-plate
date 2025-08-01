import { Router } from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  createUserByAdmin,
  getDashboardData,
} from "../controllers/admin.controller";
import {
  getCategories,
  getProductsByCategory,
} from "../../category/controllers/category.controller";
import { protect } from "@/shared/middleware/auth.middleware";
import { checkRole } from "@/shared/middleware/rbac.middleware";
import { createJob } from "../../jobs/controllers/jobs.controller";
import { getExpenses } from "@/modules/expense/controllers/expense.controller";

const router = Router();

router.use(protect, checkRole("admin"));

router.post("/create-category", createCategory);
router.put("/update-category/:id", updateCategory);
router.post("/delete-category/:id", deleteCategory);

router.post("/create-product", createProduct);
router.put("/update-product/:id", updateProduct);
router.post("/delete-product/:id", deleteProduct);

router.get("/categories", getCategories); 
router.get("/categories/products/:id", getProductsByCategory);

router.post("/create-user", createUserByAdmin);
router.post("/create-job", createJob);

router.get("/expenses", getExpenses);

router.get("/graph-data", getDashboardData); //for any year ?year=2023

export default router;