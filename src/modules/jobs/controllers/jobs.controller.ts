import { Request, Response } from "express";
import { asyncWrapper } from "../../../lib/fn-wrapper";
import { createJobDto, updateJobDto } from "../dto/jobs.dto";
import { db } from "../../../drizzle/db"
import { jobs } from "../../../drizzle/schema/jobs";
import { eq, and, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const createJob = asyncWrapper(async (req: Request, res: Response) => {
  const parsed = createJobDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { title, salary, description, user_id } = parsed.data;
  const loggedInUser = (req as any).user;

  let targetUserId = loggedInUser.id;
  if (loggedInUser.role === "admin" && user_id) {
    targetUserId = user_id;
  }

  const [existingJob] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, targetUserId), eq(jobs.isDeleted, false)));

  if (existingJob) {
    return res.status(400).json({ error: "You already have an active job." });
  }

  const [job] = await db
    .insert(jobs)
    .values({
      title,
      description,
      salary,
      userId: targetUserId,
    })
    .returning();

  res.status(201).json({ message: "Job created successfully", job });
});

export const getAllJobs = asyncWrapper(async (_req, res) => {
  const result = await db
    .select()
    .from(jobs)
    .where(eq(jobs.isDeleted, false))
    .orderBy(desc(jobs.createdAt));

  res.status(200).json({ jobs: result });
});

export const getJobById = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.isDeleted, false)));

  if (!job) return res.status(404).json({ error: "Job not found" });
  res.status(200).json({ job });
});

export const getMyJob = asyncWrapper(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.isDeleted, false)))
    .orderBy(desc(jobs.createdAt))
    .limit(1);

  if (!job) return res.status(404).json({ error: "No job found for this user" });
  res.status(200).json({ job });
});

export const updateJob = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;
  const parsed = updateJobDto.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

  const { title, salary } = parsed.data;

  const [job] = await db
    .update(jobs)
    .set({ title, salary })
    .where(and(eq(jobs.id, id), eq(jobs.isDeleted, false)))
    .returning();

  if (!job) return res.status(404).json({ error: "Job not found or deleted" });

  res.status(200).json({ message: "Job updated", job });
});

export const deleteJob = asyncWrapper(async (req: Request, res: Response) => {
  const { id } = req.params;

  const [job] = await db
    .update(jobs)
    .set({ isDeleted: true })
    .where(and(eq(jobs.id, id), eq(jobs.isDeleted, false)))
    .returning();

  if (!job) return res.status(404).json({ error: "Job not found or already deleted" });

  res.status(200).json({ message: "Job soft-deleted", job });
});
