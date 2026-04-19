
import {Router} from "express";
import { editMealEntry, deleteMealEntry, addMealWithPhoto} from "../controllers/meal.controller.js";
import { processMealInput } from "../controllers/mlMeal.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

// ML-powered single endpoint — ML detects intent (ADD/REMOVE/UPDATE) automatically
router.post("/process", verifyJWT, processMealInput);

router.patch("/:date/:index", verifyJWT, editMealEntry);
router.delete("/:date/:index", verifyJWT, deleteMealEntry);
router.post("/add-with-photo", verifyJWT, upload.single("photo"), addMealWithPhoto);
export default router;
