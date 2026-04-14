import express from "express";
import { parseMeal } from "../controllers/parser.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { parserSchema } from "../validators/parser.schema.js";

const router = express.Router();

router.post("/", validateRequest(parserSchema), parseMeal);

export default router;