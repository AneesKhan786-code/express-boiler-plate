import { db } from "../../../drizzle/db";
import { users } from "../../../drizzle/schema/users";
import { expenses } from "../../../drizzle/schema/expenses";
import { userPositions } from "../../../drizzle/schema/userPositions";
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

// Local date string in yyyy-mm-dd
function getLocalDateString(): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString().split("T")[0];
}

export const getAllUserPerformance = async (): Promise<FinalUserPerformance[]> => {
  const today = getLocalDateString();

  // Get all users
  const allUsers = await db
    .select({ id: users.id, name: users.name })
    .from(users)
    .where(eq(users.role, "user"));

  const performanceData: UserStat[] = [];

  for (const user of allUsers) {
    const [expenseData] = await db
      .select({ total: sum(expenses.amount).as("total") })
      .from(expenses)
      .where(eq(expenses.userId, user.id));

    performanceData.push({
      userId: user.id,
      name: user.name,
      totalExpenses: Number(expenseData?.total ?? 0),
    });
  }

  // Sort descending by expenses
  performanceData.sort((a, b) => b.totalExpenses - a.totalExpenses);

  const finalResult: FinalUserPerformance[] = [];

  for (let index = 0; index < performanceData.length; index++) {
    const item = performanceData[index];
    const currentPosition = index + 1;

    const [prevData] = await db
      .select({
        lastPosition: userPositions.lastPosition,
        lastUpdatedDate: userPositions.lastUpdatedDate,
        upBy: userPositions.upBy,       // DB me ye columns add hone chahiye
        downBy: userPositions.downBy,   // DB me ye columns add hone chahiye
      })
      .from(userPositions)
      .where(eq(userPositions.userId, item.userId));

    let upBy = 0;
    let downBy = 0;

    if (prevData) {
      if (prevData.lastUpdatedDate === today) {
        // Same day → agar position change hoti hai to increment karo
        upBy = prevData.upBy ?? 0;
        downBy = prevData.downBy ?? 0;

        if (prevData.lastPosition > currentPosition) {
          upBy += 1;
        } else if (prevData.lastPosition < currentPosition) {
          downBy += 1;
        }

        await db
          .update(userPositions)
          .set({
            lastPosition: currentPosition,
            upBy,
            downBy
          })
          .where(eq(userPositions.userId, item.userId));
      } else {
        // New day → reset counters
        upBy = 0;
        downBy = 0;
        await db
          .update(userPositions)
          .set({
            lastPosition: currentPosition,
            lastUpdatedDate: today,
            upBy: 0,
            downBy: 0
          })
          .where(eq(userPositions.userId, item.userId));
      }
    } else {
      // First time entry
      await db.insert(userPositions).values({
        userId: item.userId,
        lastPosition: currentPosition,
        lastUpdatedDate: today,
        upBy: 0,
        downBy: 0
      });
    }

    finalResult.push({
      uuid: item.userId,
      name: item.name,
      totalExpenses: item.totalExpenses,
      position: currentPosition,
      upBy,
      downBy,
    });
  }

  return finalResult;
};
