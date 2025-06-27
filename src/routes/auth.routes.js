import { Router } from "express";
import {forgotPassword,resetPassword} from "../controllers/auth.controller.js"

const router = Router()

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;