import { Router } from "express";
import { getCategories, getProductsByCategory } from "../controllers/category.controller";

const router = Router();


router.get("/", getCategories);
router.get("/:id/products", getProductsByCategory);

export default router;
