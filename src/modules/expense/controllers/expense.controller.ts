import { withDb } from "@/utils/db"; // 👈 Import helper
import { asyncWrapper } from "@/lib/fn-wrapper";
import { HttpError } from "@/lib/fn-error";

export const addExpense = asyncWrapper(async (req, res, next) => {
  const { title, amount, category } = req.body;
  const user = (req as any).user;

  if (!title || !amount) {
    return next(new HttpError("Title and amount are required", 400));
  }

  await withDb(async (client) => {
    const result = await client.query(
      `INSERT INTO expenses (user_id, title, amount, category)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [user.id, title, amount, category]
    );

    res.status(201).json({ expense: result.rows[0] });
  });
});
