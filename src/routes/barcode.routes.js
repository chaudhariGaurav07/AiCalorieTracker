import Router from "express";

import { addMealFromBarcode, getBarcodeInfo } from "../controllers/barcode.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.get("/info/:barcode", verifyJWT, getBarcodeInfo)
router.post("/add-from-barcode", verifyJWT, addMealFromBarcode)

export default router;
