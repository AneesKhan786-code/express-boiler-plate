// utils/helper.ts

export function fillMissingMonths(data: any[], year: number) {
  const fullYearMonths = Array.from({ length: 12 }).map((_, i) => {
    const date = new Date(year, i);
    return {
      key: `${year}-${String(i + 1).padStart(2, "0")}`,
      label: date.toLocaleString("default", { month: "long" }),
    };
  });

  const normalizedData = data.reduce((acc, curr) => {
    acc[curr.month] = {
      month: curr.month,
      products: parseInt(curr.products),
      expenses: parseFloat(curr.expenses),
    };
    return acc;
  }, {} as Record<string, { month: string; products: number; expenses: number }>);

  const finalData = fullYearMonths.map(({ label }) => {
    return normalizedData[label] || {
      month: label,
      products: 0,
      expenses: 0,
    };
  });

  return finalData;
}
