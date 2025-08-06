import { Router } from "express";
import { createJob , getAllJobs , getJobById , updateJob , deleteJob , getMyJob } from "../controllers/jobs.controller";
import { protect } from "../../../shared/middleware/auth.middleware";
import { checkRole } from "../../../shared/middleware/rbac.middleware"; 

const router = Router();

router.post("/create-job", protect, checkRole("admin"), createJob);

router.get("/all-jobs", protect, checkRole("admin"), getAllJobs);

router.get("/single-jobs/:id", protect, checkRole("admin"), getJobById);

router.put("/update-jobs/:id", protect, checkRole("admin"), updateJob);

router.delete("/delete-jobs/:id", protect, checkRole("admin"), deleteJob);

router.get("/my-job", protect, getMyJob);

export default router;