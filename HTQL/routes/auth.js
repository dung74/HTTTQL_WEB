import { Router } from "express";
import * as AuthController from "../controller/auth.js";
import verifyToken from "../middlewares/verifyToken.js";
import authorization from "../middlewares/authorization.js";
import asyncHandler from "../middlewares/asyncHandler.js";

const router = Router();

router.post("/register", asyncHandler(AuthController.register));
router.post("/login", asyncHandler(AuthController.login));
router.get("/getAll", asyncHandler(AuthController.getAllUsers));
router.put("/:id", verifyToken, asyncHandler(AuthController.updateUser));

export default router;
