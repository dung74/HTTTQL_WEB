import { Router } from "express";

import * as ProductController from "../controller/product.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import verifyToken from "../middlewares/verifyToken.js";
import authorization from "../middlewares/authorization.js";

const router = Router();

router.post("", verifyToken, asyncHandler(ProductController.insertProduct));
router.get("", verifyToken, asyncHandler(ProductController.getAllProduct));
router.delete("", verifyToken, asyncHandler(ProductController.deleteProduct));
router.put("", verifyToken, asyncHandler(ProductController.updateProduct));

export default router;
