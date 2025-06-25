import { Router } from "express";
import {changeCurrentPassword, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails} from "../controllers/user.controller.js"
import { verifyJWT } from "../middlewares/auth.middlware.js"


const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/update-account").post(verifyJWT, updateAccountDetails)
router.route("/change-password").post(verifyJWT, changeCurrentPassword)
router.route("/refresh-token").post(refreshAccessToken);


export default router;
