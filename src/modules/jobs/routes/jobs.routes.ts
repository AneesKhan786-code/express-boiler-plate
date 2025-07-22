import { Router } from "express";
import { createJob , getAllJobs , getJobById , updateJob , deleteJob , getMyJob } from "../controllers/jobs.controller";
import { protect } from "../../../shared/middleware/auth.middleware";
import { checkRole } from "@/shared/middleware/rbac.middleware"; 

const router = Router();

// only admin can access
router.post("/create-job", protect, checkRole("admin"), createJob);

//  Get all jobs (admin panel list view)
router.get("/all-jobs", protect, checkRole("admin"), getAllJobs);

//  Get job detail by ID
router.get("/single-jobs/:id", protect, checkRole("admin"), getJobById);

//  Update a job by ID
router.put("/update-jobs/:id", protect, checkRole("admin"), updateJob);

//  Soft delete a job by ID
router.delete("/delete-jobs/:id", protect, checkRole("admin"), deleteJob);

// User Route: See their own job only
router.get("/my-job", protect, getMyJob);

export default router;