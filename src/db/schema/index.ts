// ✅ Corrected: src/db/schema/index.ts
import { users } from "./users";
import { jobs } from "./jobs";
import { expenses } from "./expenses";
import { products } from "./products";
import { categories } from "./categories";

// 👇 Ye object drizzle ke liye schema pass karega
export const schema = {
  users,
  jobs,
  expenses,
  products,
  categories,
};

// 👇 Ye individual exports karega taake controllers ya services use kar sakein
export { users, jobs, expenses, products, categories };
