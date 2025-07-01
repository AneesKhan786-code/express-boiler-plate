import { Router } from "express";
import { createJob } from "../controllers/jobs.controller";
import { protect } from "../../../shared/middleware/auth.middleware"; // ✅ middleware needed here too

const router = Router();

router.post("/", protect, createJob); // ✅ secure job creation

export default router;
