import { Router } from "express";
import {
  createCategory,
  createProduct,
  updateCategory,
  deleteCategory,
} from "../controllers/admin.controller";
import { protect as verifyToken  } from "@/shared/middleware/auth.middleware";
import { checkRole } from "@/shared/middleware/rbac.middleware";

const adminRouter = Router();
// admin.routes.ts
adminRouter.post("/create-category", verifyToken, checkRole("admin"), createCategory);
adminRouter.post("/create-product", verifyToken, checkRole("admin"), createProduct);
adminRouter.put("/update-category/:id", verifyToken, checkRole("admin"), updateCategory);
adminRouter.delete("/delete-category/:id", verifyToken, checkRole("admin"), deleteCategory);

export default adminRouter;