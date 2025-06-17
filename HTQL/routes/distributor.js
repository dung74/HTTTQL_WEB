import { Router } from "express";

import * as DistributorController from "../controller/distributer.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import verifyToken from "../middlewares/verifyToken.js";
import authorization from "../middlewares/authorization.js";

const router = Router();

router.post(
  "",
  verifyToken,
  asyncHandler(DistributorController.insertDistributor)
);
router.get(
  "",
  verifyToken,
  asyncHandler(DistributorController.getAllDistributor)
);
router.put(
  "",
  verifyToken,
  asyncHandler(DistributorController.updateDistributor)
);
router.delete(
  "",
  verifyToken,
  asyncHandler(DistributorController.deleteDistributor)
);

export default router;
