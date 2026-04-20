import { Router } from "express";
import { getUnrecognizedLogs, approveAlias, deleteLog, getMLStatus, refreshCache } from "../controllers/admin.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middlware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.route("/logs/unrecognized").get(getUnrecognizedLogs);
router.route("/logs/unrecognized/approve").post(approveAlias);
router.route("/logs/unrecognized/:id").delete(deleteLog);
router.route("/ml-status").get(getMLStatus);
router.route("/refresh-cache").get(refreshCache);

export default router;
