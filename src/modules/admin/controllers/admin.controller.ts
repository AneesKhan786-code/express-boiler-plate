import pool from "@/adapters/postgres/postgres.adapter";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";
import { createCategoryDto, createProductDto } from "../dto/admin.dto";
import { hash } from "bcryptjs";
import { sendUserCredentials } from "@/modules/user/services/mail.service";

export const createCategory = asyncWrapper(async (req, res, next) => {
  const parsed = createCategoryDto.safeParse(req.body);
  if (!parsed.success) return next(new HttpError("Invalid input", 400));

  const result = await pool.query(
    "INSERT INTO categories (name) VALUES ($1) RETURNING *",
    [parsed.data.name]
  );

  res.status(201).json({ category: result.rows[0] });
});

export const createProduct = asyncWrapper(async (req, res, next) => {
  const parsed = createProductDto.safeParse(req.body);
  if (!parsed.success) return next(new HttpError("Invalid input", 400));

  const { name, price, category_id } = parsed.data;

  const result = await pool.query(
    "INSERT INTO products (name, price, category_id) VALUES ($1, $2, $3) RETURNING *",
    [name, price, category_id]
  );

  res.status(201).json({ product: result.rows[0] });
});

export const updateCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.body;

  const result = await pool.query(
    "UPDATE categories SET name = $1 WHERE id = $2 RETURNING *",
    [name, id]
  );

  if (!result.rowCount) return next(new HttpError("Category not found", 404));

  res.status(200).json({ category: result.rows[0] });
});

export const deleteCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const { rowCount: checkCount } = await pool.query(
    "SELECT 1 FROM categories WHERE id = $1 AND is_deleted = false",
    [id]
  );

  if (!checkCount)
    return next(new HttpError("Category not found or already deleted", 404));

  const result = await pool.query(
    "UPDATE categories SET is_deleted = true WHERE id = $1 RETURNING *",
    [id]
  );

  res.status(200).json({
    message: "Category soft-deleted",
    deleted: result.rows[0],
  });
});

export const updateProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, category_id } = req.body;

  const result = await pool.query(
    "UPDATE products SET name = $1, price = $2, category_id = $3 WHERE id = $4 RETURNING *",
    [name, price, category_id, id]
  );

  if (!result.rowCount) return next(new HttpError("Product not found", 404));

  res.status(200).json({ product: result.rows[0] });
});

export const deleteProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const { rowCount } = await pool.query(
    "SELECT 1 FROM products WHERE id = $1 AND is_deleted = false",
    [id]
  );

  if (!rowCount)
    return next(new HttpError("Product not found or already deleted", 404));

  const result = await pool.query(
    "UPDATE products SET is_deleted = true WHERE id = $1 RETURNING *",
    [id]
  );

  res.status(200).json({ message: "Product soft-deleted", deleted: result.rows[0] });
});

export const createUserByAdmin = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;

  const hashedPassword = await hash(password, 10);

  const existing = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
  if (existing.rowCount) return next(new HttpError("User already exists", 409));

  const {
    rows: [user],
  } = await pool.query(
    `INSERT INTO users (id, name, email, password, role, verified)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5)
     RETURNING id, name, email`,
    [name, email, hashedPassword, "user", false]
  );

  await sendUserCredentials({ name, email, password });

  res.status(201).json({
    message: "User created and credentials sent via email.",
    user,
  });
});
