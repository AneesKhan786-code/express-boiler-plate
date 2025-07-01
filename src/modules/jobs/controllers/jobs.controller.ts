import { Request, Response } from "express";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { createJobDto } from "../dto/jobs.dto";
import pool from "@/adapters/postgres/postgres.adapter";

export const createJob = asyncWrapper(async (req: Request, res: Response) => {
  const parsed = createJobDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { title, salary } = parsed.data;
  const userId = (req as any).user.id;

  const {
    rows: [job],
  } = await pool.query(
    `INSERT INTO jobs (user_id, title, salary) VALUES ($1, $2, $3) RETURNING *`,
    [userId, title, salary]
  );

  res.status(201).json({ message: "Job created successfully", job });
});
