import * as CustomerController from "../controller/customer.js";
import verifyToken from "../middlewares/verifyToken.js";
import asyncHandler from "../middlewares/asyncHandler.js";

import { Router } from "express";

const router = Router();

router.get("/", verifyToken, asyncHandler(CustomerController.getAllCustomers));

export default router;
