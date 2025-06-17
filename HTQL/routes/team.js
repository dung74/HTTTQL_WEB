import { Router } from "express";
import * as Team from "../controller/Team.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import verifyToken from "../middlewares/verifyToken.js";

const route = Router();

route.post("", verifyToken, asyncHandler(Team.createTeam));
route.delete("", verifyToken, asyncHandler(Team.deleteTeam));
route.get("", verifyToken, asyncHandler(Team.getAllTeams));
route.get("/id", verifyToken, asyncHandler(Team.getTeamById));
route.put("/:id", verifyToken, asyncHandler(Team.updateTeam));

export default route;
