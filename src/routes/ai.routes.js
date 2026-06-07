import { Router } from "express";
import { processMealInput, warmupML } from "../controllers/mlMeal.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router();

router.post("/parse-food", verifyJWT, processMealInput);
router.get("/warmup", verifyJWT, warmupML);

export default router;