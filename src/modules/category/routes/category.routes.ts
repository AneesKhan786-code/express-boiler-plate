import { Router } from "express";
import { getCategories, getProductsByCategory } from "../controllers/category.controller";

const router = Router();

router.get("/get-categories", getCategories);
router.get("/products/:id", getProductsByCategory);

export default router;