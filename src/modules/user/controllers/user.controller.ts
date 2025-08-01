import { Request, Response, NextFunction } from "express";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema/users";
import { jobs } from "@/db/schema/jobs";
import { expenses } from "@/db/schema/expenses";
import { eq, and, sql } from "drizzle-orm";
import { sendNoteToUser } from "../services/mail.service";

// ✅ Get Job & Today's Expense using Drizzle ORM
export const getUserJobAndTodayExpense = asyncWrapper(async (req: Request, res: Response, next) => {
  const userId = (req as any).user.id;

  // 🔹 Get User Name
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      name: true,
    },
  });

  // 🔹 Get Job Title (LIMIT 1)
  const job = await db.query.jobs.findFirst({
    where: eq(jobs.userId, userId),
    columns: {
      title: true,
    },
  });

  // 🔹 Get Today's Expenses
  const todayExpenses = await db
    .select({
      amount: expenses.amount,
      description: expenses.description,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        sql`DATE(${expenses.createdAt}) = CURRENT_DATE`
      )
    );

  // 🔹 Response
  res.status(200).json({
    data: {
      name: user?.name,
      job_title: job?.title || null,
      today_expenses: todayExpenses || [],
    },
  });
});

// ✅ Send Note Email Controller (no changes required)
export const sendNoteEmailController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { user_id, note, title } = req.body;
    const info = await sendNoteToUser({ userId: user_id, note, title });

    res.status(200).json({ message: "Email sent successfully", info });
  } catch (err) {
    next(err);
  }
};
