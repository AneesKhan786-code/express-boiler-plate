import { drizzle } from 'drizzle-orm/node-postgres';
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../../drizzle/db";
import { users, products, categories } from "../../../drizzle/index";
import { asyncWrapper } from "../../../lib/fn-wrapper";
import { HttpError } from "../../../lib/fn-error";
import { createCategoryDto, createProductDto } from "../dto/admin.dto";
import { hash } from "bcryptjs";
import { sendUserCredentials } from "@/modules/user/services/mail.service";
import { getDashboardDataService } from "../services/admin.service";

export const getDashboardData = asyncWrapper(async (req: Request, res: Response) => {
  const year = parseInt(req.query.year as string) || new Date().getFullYear();
  const data = await getDashboardDataService(year);
  res.status(200).json(data);
});

//  Create Category
export const createCategory = asyncWrapper(async (req, res, next) => {
  const parsed = createCategoryDto.safeParse(req.body);
  if (!parsed.success) return next(new HttpError("Invalid input", 400));

  const [category] = await db.insert(categories).values({
    name: parsed.data.name,
  }).returning();

  res.status(201).json({ category });
});

// Create Product
export const createProduct = asyncWrapper(async (req, res, next) => {
  const parsed = createProductDto.safeParse(req.body);
  if (!parsed.success) return next(new HttpError("Invalid input", 400));

  const { name, price, category_id } = parsed.data;

  const [product] = await db.insert(products).values({
    name,
    price,
    categoryId: category_id,
  }).returning();

  res.status(201).json({ product });
});

// Update Category
export const updateCategory = asyncWrapper(async (req, res, next) => {
  const categoryId = req.params.id; // ✅ keep as string (UUID)
  const { name } = req.body;

  const [category] = await db.update(categories)
    .set({ name })
    .where(eq(categories.id, categoryId))
    .returning();

  if (!category) return next(new HttpError("Category not found", 404));

  res.status(200).json({ category });
});


// Soft Delete Category
export const deleteCategory = asyncWrapper(async (req, res, next) => {
  const categoryId = req.params.id; // ✅ UUID, no Number()

  const [existing] = await db.select().from(categories).where(eq(categories.id, categoryId));

  if (!existing || existing.deleted) // ✅ changed isDeleted → deleted
    return next(new HttpError("Category not found or already deleted", 404));

  const [deleted] = await db.update(categories)
    .set({ deleted: true }) // ✅ changed isDeleted → deleted
    .where(eq(categories.id, categoryId))
    .returning();

  res.status(200).json({
    message: "Category soft-deleted",
    deleted,
  });
});

// Update Product
export const updateProduct = asyncWrapper(async (req, res, next) => {
  const productId = Number(req.params.id);
  const { name, price, category_id } = req.body;

  const [product] = await db.update(products)
    .set({
      name,
      price,
      categoryId: category_id,
    })
    .where(eq(products.id, productId))
    .returning();

  if (!product) return next(new HttpError("Product not found", 404));

  res.status(200).json({ product });
});


//  Soft Delete Product
export const deleteProduct = asyncWrapper(async (req, res, next) => {
  const productId = Number(req.params.id); // this one is fine (number type)

  const [existing] = await db.select().from(products).where(eq(products.id, productId));

  if (!existing || existing.deleted) // ✅ fix isDeleted → deleted
    return next(new HttpError("Product not found or already deleted", 404));

  const [deleted] = await db.update(products)
    .set({ deleted: true }) // ✅ fix isDeleted → deleted
    .where(eq(products.id, productId))
    .returning();

  res.status(200).json({
    message: "Product soft-deleted",
    deleted,
  });
});

//  Admin Creates User
export const createUserByAdmin = asyncWrapper(async (req, res, next) => {
  const { name, email, password } = req.body;

  const hashedPassword = await hash(password, 10);

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length)
    return next(new HttpError("User already exists", 409));

  const [user] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
    role: "user",
    verified: false,
  }).returning({
    id: users.id,
    name: users.name,
    email: users.email,
  });

  await sendUserCredentials({ name, email, password });

  res.status(201).json({
    message: "User created and credentials sent via email.",
    user,
  });
});
