import { db } from "../../../drizzle/db";
import { users } from "../../../drizzle/schema/users";
import { expenses } from "../../../drizzle/schema/expenses";
import { sum, eq } from "drizzle-orm";

interface UserStat {
  userId: string;
  name: string;
  totalExpenses: number;
}

interface FinalUserPerformance {
  uuid: string;
  name: string;
  totalExpenses: number;
  position: number;
  upBy: number;
  downBy: number;
}

// Memory-based last positions (reset on server restart)
let previousPositions: Record<string, number> = {};

export const getAllUserPerformance = async (): Promise<FinalUserPerformance[]> => {
  // Get all users with role 'user'
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name
    })
    .from(users)
    .where(eq(users.role, "user"));

  const performanceData: UserStat[] = [];

  for (const user of allUsers) {
    // Get total expenses for this user
    const [expenseData] = await db
      .select({ total: sum(expenses.amount).as("total") })
      .from(expenses)
      .where(eq(expenses.userId, user.id));

    const totalExpenses = Number(expenseData?.total ?? 0);

    performanceData.push({
      userId: user.id,
      name: user.name,
      totalExpenses
    });
  }

  // Sort by expenses (highest first)
  performanceData.sort((a, b) => b.totalExpenses - a.totalExpenses);

  // Prepare final result with position changes
  const finalResult: FinalUserPerformance[] = performanceData.map((item, index) => {
    const currentPosition = index + 1;
    const prevPosition = previousPositions[item.userId] ?? currentPosition;

    const upBy = prevPosition > currentPosition ? 1 : 0;
    const downBy = prevPosition < currentPosition ? 1 : 0;

    // Save current position for next request
    previousPositions[item.userId] = currentPosition;

    return {
      uuid: item.userId,
      name: item.name,
      totalExpenses: item.totalExpenses,
      position: currentPosition,
      upBy,
      downBy
    };
  });

  return finalResult;
};
