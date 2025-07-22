import { Request, Response } from "express";
import pool from "@/adapters/postgres/postgres.adapter";
import { asyncWrapper } from "@/lib/fn-wrapper";

// ✅ Get non-deleted categories
export const getCategories = asyncWrapper(async (_req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM categories WHERE deleted = false ORDER BY created_at DESC"
  );
  res.status(200).json({ categories: rows });
});

// ✅ Get non-deleted products by category ID
export const getProductsByCategory = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT * FROM products WHERE category_id = $1 AND deleted = false",
    [id]
  );
  res.status(200).json({ products: rows });
});
