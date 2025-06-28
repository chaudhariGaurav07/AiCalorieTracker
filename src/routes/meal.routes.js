
import {Router} from "express";
import { editMealEntry, deleteMealEntry, addMealWithPhoto} from "../controllers/meal.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.patch("/:date/:index", verifyJWT, editMealEntry);
router.delete("/:date/:index", verifyJWT, deleteMealEntry);
router.post("/add-with-photo", verifyJWT, upload.single("photo"), addMealWithPhoto);
export default router;
