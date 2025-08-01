import { Router } from "express";

const baseRouter = Router();

baseRouter.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Server is running",
    time: new Date().toISOString(),
  });
});

export default baseRouter;