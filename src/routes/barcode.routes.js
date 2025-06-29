import Router from "express";

import { addMealFromBarcode } from "../controllers/barcode.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.post("/add-from-barcode", verifyJWT, addMealFromBarcode)

export default router;
