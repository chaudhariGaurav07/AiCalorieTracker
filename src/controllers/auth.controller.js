import * as crypto from "node:crypto";
import { generateResetToken } from "../utils/generateResetToken.js";
import { sendMail } from "../utils/sendMail.js"; // use nodemailer or Resend
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponce} from "../utils/Apiresponce.js"

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { token, hashedToken } = generateResetToken();

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min
  await user.save({ validateBeforeSave: false });

  const resetUrl = `http://your-frontend-url/reset-password/${token}`;
  console.log(" Reset Link:", resetUrl); 


  await sendMail({
    to: user.email,
    subject: "Password Reset Link",
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link valid for 15 mins.</p>`,
  });

  return res.status(200).json(new ApiResponce(200, {}, "Reset link sent to email"));
});

export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
  
    //  Validate new password
    if (!newPassword || newPassword.trim() === "") {
      throw new ApiError(400, "New password is required");
    }
  
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
  
    if (!user) {
      throw new ApiError(400, "Invalid or expired token");
    }
  
    // Assign and save new password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
  
    await user.save(); // saved in db
  
    return res
      .status(200)
      .json(new ApiResponce(200, {}, "Password reset successfully"));
  });
  