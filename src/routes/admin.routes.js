import { Router } from "express";
import { 
  getUnrecognizedLogs, 
  approveAlias, 
  deleteLog, 
  getMLStatus, 
  refreshCache,
  getFoods,
  createFood,
  updateFood,
  deleteFood
} from "../controllers/admin.controller.js";
import { verifyJWT, verifyAdmin } from "../middlewares/auth.middlware.js";

const router = Router();

router.use(verifyJWT, verifyAdmin);

router.route("/logs/unrecognized").get(getUnrecognizedLogs);
router.route("/logs/unrecognized/approve").post(approveAlias);
router.route("/logs/unrecognized/:id").delete(deleteLog);
router.route("/ml-status").get(getMLStatus);
router.route("/refresh-cache").get(refreshCache);

// Food Management
router.route("/foods").get(getFoods);
router.route("/foods").post(createFood);
router.route("/foods/:id").patch(updateFood);
router.route("/foods/:id").delete(deleteFood);

export default router;
