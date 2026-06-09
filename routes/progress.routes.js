import { Router } from "express";
import { getDailyProgress } from "../controllers/progress.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.get("/", verifyJWT, getDailyProgress);


export default router;