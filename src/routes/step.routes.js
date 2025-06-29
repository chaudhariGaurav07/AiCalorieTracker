import Router from "express";
import { logStepCount } from "../controllers/step.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router();

router.post("/log-steps", verifyJWT, logStepCount);

export default router;