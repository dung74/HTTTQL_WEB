import { Router } from "express";
import * as Manager from "../controller/manager.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import verifyToken from "../middlewares/verifyToken.js";

const route = Router();

route.post("/", verifyToken, asyncHandler(Manager.createManager));
route.get("/", verifyToken, asyncHandler(Manager.getAllManagers));

export default route;
