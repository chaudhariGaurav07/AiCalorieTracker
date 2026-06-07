import { Router } from "express";
import {
  changeCurrentPassword,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  requestRegisterOtp,
  verifyRegisterOtpAndRegister,
  requestLoginOtp,
  verifyLoginOtp,
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middlware.js";

const router = Router();

// Standard auth routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// OTP-based auth routes
router.post("/register/request-otp", requestRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtpAndRegister);
router.post("/login/request-otp", requestLoginOtp);
router.post("/login/verify-otp", verifyLoginOtp);
router.post("/forgot-password/request-otp", requestForgotPasswordOtp);
router.post("/forgot-password/verify-otp", verifyForgotPasswordOtp);

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-account").post(verifyJWT, updateAccountDetails);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/refresh-token").post(refreshAccessToken);
router.get("/me", verifyJWT, getCurrentUser);

export default router;
