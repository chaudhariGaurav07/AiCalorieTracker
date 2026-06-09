import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt  from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
  
      if(!token) {
          throw new ApiError(401, "Unauthorized request")
      }
  
      const decodeToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
      const user = await User.findById(decodeToken?._id).select(
          "-password -refreshToken"
      )
      
      if(!user) {
          throw new ApiError(401, "Invalid access token")
      }
  
      req.user = user;
      next()
  } catch (error) {
     throw new ApiError(401, error?.message || "Invalid access token")
  }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  // verifyJWT should always run before verifyAdmin
  if (!req.user) {
    throw new ApiError(401, "Unauthorized access. User is not authenticated.");
  }

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Forbidden. Only admins can access this route.");
  }

  next();
});
