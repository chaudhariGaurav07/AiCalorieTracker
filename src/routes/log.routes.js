import { Router } from "express";
import {getTodayLog} from "../controllers/getTodayLog.controller.js"
import {getLogHistory} from "../controllers/getLogHistory.controller.js"
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.get("/todays-log",verifyJWT, getTodayLog)
router.get("/history",verifyJWT, getLogHistory)

export default router;