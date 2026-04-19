import { Router } from "express";
import { processMealInput } from "../controllers/mlMeal.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router();

router.post("/parse-food", verifyJWT, processMealInput);

export default router;