// src/routes/meal.routes.js
import {Router} from "express";
import { editMealEntry, deleteMealEntry } from "../controllers/meal.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router();

router.patch("/:date/:index", verifyJWT, editMealEntry);
router.delete("/:date/:index", verifyJWT, deleteMealEntry);

export default router;
