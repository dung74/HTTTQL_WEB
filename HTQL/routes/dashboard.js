import { Router } from "express";

import * as DashboardController from "../controller/dashboard.js";
import verifyToken from "../middlewares/verifyToken.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = Router();

router.get(
  "/",
  verifyToken,
  asyncHandler(DashboardController.getDashboardData)
);

export default router;
