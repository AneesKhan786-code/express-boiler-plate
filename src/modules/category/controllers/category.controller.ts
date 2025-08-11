import { Request, Response } from "express";
import { db } from "../../../drizzle/db"
import { categories } from "../../../drizzle/schema/categories";
import { products } from "../../../drizzle/schema/products";
import { eq, and } from "drizzle-orm";
import { asyncWrapper } from "../../../lib/fn-wrapper";

//  GET All Categories (not deleted)
export const getCategories = asyncWrapper(async (_req: Request, res: Response) => {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.deleted, false))
    .orderBy(categories.createdAt);

  res.status(200).json({ categories: result });
});

// GET Products by Category ID (not deleted)
// GET Products by Category ID (not deleted)
export const getProductsByCategory = asyncWrapper(async (req: Request, res: Response) => {
  const { id: categoryId } = req.params; // ✅ UUID is string — do NOT convert to number

  const result = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.categoryId, categoryId),
        eq(products.deleted, false)
      )
    );

  res.status(200).json({ products: result });
});
