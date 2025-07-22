import { Router } from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  createUserByAdmin,
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

//  Category Routes
router.post("/create-category", protect, checkRole("admin"), createCategory);
router.put("/update-category/:id", protect, checkRole("admin"), updateCategory);
router.post("/delete-category/:id", protect, checkRole("admin"), deleteCategory);

//  Product Routes
router.post("/create-product", protect, checkRole("admin"), createProduct);
router.put("/update-product/:id", protect, checkRole("admin"), updateProduct);
router.post("/delete-product/:id", protect, checkRole("admin"), deleteProduct);

//  View Routes (admin also users)
router.get("/categories", protect, getCategories);
router.get("/categories/products/:id", protect, getProductsByCategory);

// Admin create user + job
router.post("/create-user", protect, checkRole("admin"), createUserByAdmin);
router.post("/create-job", protect, checkRole("admin"), createJob);

//admin can view expenses also
router.get("/expenses", protect, getExpenses);

export default router;