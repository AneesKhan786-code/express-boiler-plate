import { Request, Response } from "express";
import { asyncWrapper } from "@/lib/fn-wrapper";
import { createJobDto, updateJobDto } from "../dto/jobs.dto";
import pool from "@/adapters/postgres/postgres.adapter";

export const createJob = asyncWrapper(async (req: Request, res: Response) => {
  const parsed = createJobDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { title, salary, user_id } = parsed.data;
  const loggedInUser = (req as any).user;

  let targetUserId = loggedInUser.id;

  if (loggedInUser.role === "admin" && user_id) {
    targetUserId = user_id;
  }

  const {
    rows: [job],
  } = await pool.query(
    `INSERT INTO jobs (user_id, title, salary) VALUES ($1, $2, $3) RETURNING *`,
    [targetUserId, title, salary]
  );

  res.status(201).json({ message: "Job created successfully", job });
});

export const getAllJobs = asyncWrapper(async (_req: Request, res: Response) => {
  const { rows: jobs } = await pool.query(
    `SELECT * FROM jobs WHERE is_deleted = FALSE ORDER BY created_at DESC`
  );
  res.status(200).json({ jobs });
});

export const getJobById = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    rows: [job],
  } = await pool.query(
    `SELECT * FROM jobs WHERE id = $1 AND is_deleted = FALSE`,
    [id]
  );

  if (!job) return res.status(404).json({ error: "Job not found" });
  res.status(200).json({ job });
});

export const getMyJob = asyncWrapper(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const {
    rows: [job],
  } = await pool.query(
    `SELECT * FROM jobs WHERE user_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );

  if (!job) return res.status(404).json({ error: "No job found for this user" });
  res.status(200).json({ job });
});

export const updateJob = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = updateJobDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { title, salary } = parsed.data;

  const {
    rows: [job],
  } = await pool.query(
    `UPDATE jobs SET title = $1, salary = $2 WHERE id = $3 AND is_deleted = FALSE RETURNING *`,
    [title, salary, id]
  );

  if (!job) return res.status(404).json({ error: "Job not found or deleted" });

  res.status(200).json({ message: "Job updated", job });
});

export const deleteJob = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;

  const {
    rows: [job],
  } = await pool.query(
    `UPDATE jobs SET is_deleted = TRUE WHERE id = $1 AND is_deleted = FALSE RETURNING *`,
    [id]
  );

  if (!job) return res.status(404).json({ error: "Job not found or already deleted" });

  res.status(200).json({ message: "Job soft-deleted", job });
});
