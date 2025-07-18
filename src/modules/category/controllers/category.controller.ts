import { Request, Response } from "express";
import pool from "@/adapters/postgres/postgres.adapter";
import { asyncWrapper } from "@/lib/fn-wrapper";

// Get all categories
export const getCategories = asyncWrapper(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM categories ORDER BY created_at DESC");
  res.status(200).json({ categories: rows });
});

// Get products by category
export const getProductsByCategory = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query("SELECT * FROM products WHERE category_id = $1", [id]);
  res.status(200).json({ products: result.rows });
});