import { db } from "@/db/drizzle";
import { sql } from "drizzle-orm";
import { fillMissingMonths } from "@/utils/helper";

export const getDashboardDataService = async (year: number) => {
  const result = await db.execute(
    sql`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', p.created_at), 'FMMonth') AS month,
        COUNT(p.id) AS products,
        COALESCE(SUM(e.amount), 0) AS expenses
      FROM products p
      LEFT JOIN expenses e
        ON DATE_TRUNC('month', p.created_at) = DATE_TRUNC('month', e.created_at)
        AND EXTRACT(YEAR FROM e.created_at) = ${year}
      WHERE EXTRACT(YEAR FROM p.created_at) = ${year}
      GROUP BY DATE_TRUNC('month', p.created_at)
      ORDER BY DATE_TRUNC('month', p.created_at);
    `
  );

  // Format data with helper
  const monthlyData = fillMissingMonths(result.rows, year);

  // Calculate totals
  const totalExpenses = monthlyData.reduce((sum, item) => sum + item.expenses, 0);
  const totalProducts = monthlyData.reduce((sum, item) => sum + item.products, 0);

  // Add summary object to end
  return [
    ...monthlyData,
    {
      totalExpenses,
      totalProducts,
    },
  ];
};
