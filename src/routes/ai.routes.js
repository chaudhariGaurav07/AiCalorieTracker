import { Router } from "express";
import {addMealEntry} from "../controllers/ai.controller.js"
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.post("/parse-food",verifyJWT, addMealEntry)

export default router;