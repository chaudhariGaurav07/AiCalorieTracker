import express from "express";
import { addFoods } from "../controllers/food.controller.js";

const router = express.Router();

router.post("/bulk", addFoods);

export default router;