import { Router } from "express";

import * as OrderController from "../controller/order.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import verifyToken from "../middlewares/verifyToken.js";

const router = Router();

router.post("", verifyToken, asyncHandler(OrderController.insertOrder));
router.get("", verifyToken, asyncHandler(OrderController.getAllOrder));

export default router;
