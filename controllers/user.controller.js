import * as crypto from "node:crypto";
import { generateResetToken } from "../utils/generateResetToken.js";
import { sendMail } from "../utils/sendMail.js"; // use nodemailer or Resend
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/User.model.js";
import { Otp } from "../models/Otp.model.js";
import { ApiResponce } from "../utils/Apiresponce.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //save in database

    return { refreshToken, accessToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong in refresh and access token");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  // Validation
  if ([email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  // Check for existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Create user
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
  });

  // Get safe user data
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(createdUser._id);

 return res.status(201).json(
  new ApiResponce(201, {
    accessToken,
    refreshToken,
    user: createdUser,
  }, "User Registered Successfully")
);
});


const loginUser = asyncHandler(async (req, res) => {
  //getiing data from req.body
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is required ");
  }

  //find user in db
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exits");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credential");
  }

  //access and referesh tokens
  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true, // modifieble only using server
  };

  return res.status(200).json(
    new ApiResponce(
      200,
      {
        user: loggedInUser,
        accessToken,
        refreshToken,
      },
      "User Logged in Successfully"
    )
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // removes field from docs
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true, // modifieble only usin server
  };

  return res
  .status(200)
  .json(new ApiResponce(200, {}, "user logged out successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        username,
        email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponce(200, user, "Account details updated successsfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  //finding user in db
  const user = await User.findById(req.user?._id);
  //old password validation
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ ValidateBeforeSave: false }); // saved in db

  return res
    .status(200)
    .json(new ApiResponce(200, {}, "password change successfully"));
});

// Deprecated: forgotPassword and resetPassword were removed in favor of OTP-based flow

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;


    if (!incomingRefreshToken) {
      throw new ApiError(401, "No refresh token provided");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );


    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "User not found");
    }


    if (incomingRefreshToken !== user.refreshToken) {
      // console.log("Tokens don't match");
      throw new ApiError(401, "Refresh token mismatch");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res.status(200).json(
      new ApiResponce(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed"
      )
    );
  } catch (error) {
    // console.log(" JWT error:", error?.message);
    throw new ApiError(401, error?.message || "invalid refresh token");
  }
});


const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponce(200, req.user, "Current user fetched successfully"));
});

// Helper to generate a 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const requestRegisterOtp = asyncHandler(async (req, res) => {
  const { email, username } = req.body;

  if (!email || !username) {
    throw new ApiError(400, "Email and username are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Upsert OTP for this email and purpose
  await Otp.findOneAndUpdate(
    { email: email.toLowerCase(), purpose: "register" },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  // Send Email
  await sendMail({
    to: email,
    subject: "Your Registration Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Welcome to AiCalorieTracker!</h2>
        <p>Please use the following 6-digit verification code to complete your registration:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f0f0f0; padding: 15px; display: inline-block; border-radius: 5px; letter-spacing: 2px;">
          ${otp}
        </div>
        <p>This code is valid for 5 minutes. If you did not request this code, you can safely ignore this email.</p>
      </div>
    `,
  });

  return res.status(200).json(
    new ApiResponce(200, {}, "Verification code sent to your email")
  );
});

const verifyRegisterOtpAndRegister = asyncHandler(async (req, res) => {
  const { email, username, password, otp } = req.body;

  if (!email || !username || !password || !otp) {
    throw new ApiError(400, "All fields (email, username, password, otp) are required");
  }

  // Verify OTP
  const otpRecord = await Otp.findOne({
    email: email.toLowerCase(),
    otp,
    purpose: "register",
  });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  // Delete OTP record since it's verified
  await Otp.deleteOne({ _id: otpRecord._id });

  // Double check user doesn't already exist
  const existedUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Create User
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(createdUser._id);

  return res.status(201).json(
    new ApiResponce(201, {
      accessToken,
      refreshToken,
      user: createdUser,
    }, "User registered successfully")
  );
});

const requestLoginOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.findOneAndUpdate(
    { email: email.toLowerCase(), purpose: "login" },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  await sendMail({
    to: email,
    subject: "Your Login Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>CalAI Login Verification</h2>
        <p>Please use the following 6-digit code to log in to your account:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f0f0f0; padding: 15px; display: inline-block; border-radius: 5px; letter-spacing: 2px;">
          ${otp}
        </div>
        <p>This code is valid for 5 minutes. If you did not request this login code, we recommend changing your password.</p>
      </div>
    `,
  });

  return res.status(200).json(
    new ApiResponce(200, {}, "Login verification code sent to your email")
  );
});

const verifyLoginOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and verification code are required");
  }

  const otpRecord = await Otp.findOne({
    email: email.toLowerCase(),
    otp,
    purpose: "login",
  });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  await Otp.deleteOne({ _id: otpRecord._id });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res.status(200).json(
    new ApiResponce(200, {
      user: loggedInUser,
      accessToken,
      refreshToken,
    }, "User logged in successfully")
  );
});

const requestForgotPasswordOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.findOneAndUpdate(
    { email: email.toLowerCase(), purpose: "forgot_password" },
    { otp, expiresAt },
    { upsert: true, new: true }
  );

  await sendMail({
    to: email,
    subject: "Your Password Reset Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>CalAI Password Reset</h2>
        <p>Please use the following 6-digit code to verify your identity and reset your password:</p>
        <div style="font-size: 24px; font-weight: bold; background: #f0f0f0; padding: 15px; display: inline-block; border-radius: 5px; letter-spacing: 2px;">
          ${otp}
        </div>
        <p>This code is valid for 5 minutes. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  });

  return res.status(200).json(
    new ApiResponce(200, {}, "Password reset verification code sent to your email")
  );
});

const verifyForgotPasswordOtp = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, "Email, verification code, and new password are required");
  }

  const otpRecord = await Otp.findOne({
    email: email.toLowerCase(),
    otp,
    purpose: "forgot_password",
  });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    throw new ApiError(400, "Invalid or expired verification code");
  }

  await Otp.deleteOne({ _id: otpRecord._id });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json(
    new ApiResponce(200, {}, "Password reset successfully. You can now log in.")
  );
});

export {
  registerUser,
  loginUser,
  logoutUser,
  updateAccountDetails,
  changeCurrentPassword,
  refreshAccessToken,
  getCurrentUser,
  requestRegisterOtp,
  verifyRegisterOtpAndRegister,
  requestLoginOtp,
  verifyLoginOtp,
  requestForgotPasswordOtp,
  verifyForgotPasswordOtp,
};
