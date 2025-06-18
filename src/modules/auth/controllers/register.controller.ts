import { HttpError } from "@/lib/fn-error";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { registerEntity } from "../dto/auth.dto";
import { hash } from "bcryptjs";
import pool from "../../../adapters/postgres/postgres.adapter";

export const signup = asyncWrapper(async (req, res, next) => {
  const parsed = registerEntity.safeParse(req.body);

  if (!parsed.success) {
    return next(new HttpError("Invalid input: " + JSON.stringify(parsed.error.format()), 400));
  }

  const { name, email, password } = parsed.data;

  // console.log(parsed)

  try {
    // Verify database connection first
    await pool.query('SELECT NOW()');
    
    // Check for existing user
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1", 
      [email]
    );

    if (existingUser.rows.length > 0) {
      return next(new HttpError("Email already registered", 409));
    }

    const hashedPassword = await hash(password, 10);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (name, email, password) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, name`,
      [name, email, hashedPassword]
    );

    if (result.rows.length === 0) {
      throw new Error('Insertion failed');
    }

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email
      }
    });

  } catch (err) {
    console.error('Database error:', err);
    return next(new HttpError("Registration failed", 500));
  }
});