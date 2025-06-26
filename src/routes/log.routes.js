import { Router } from "express";
import {getTodayLog} from "../controllers/getTodayLog.controller.js"
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.get("/todays-log",verifyJWT, getTodayLog)

export default router;