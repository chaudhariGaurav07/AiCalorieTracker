import express from "express";
import { parseMeal } from "../controllers/parser.controller.js";

const router = express.Router();

router.post("/", parseMeal);

export default router;