import { Router } from "express";
import {
    setOrUpdateCalorieGoal,
    getCalorieGoal,
  } from "../controllers/goal.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router()

router.post("/set",verifyJWT, setOrUpdateCalorieGoal)
router.get("/get",verifyJWT, getCalorieGoal)

export default router;