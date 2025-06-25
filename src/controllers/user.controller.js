import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User} from "../models/user.model.js";
import { ApiResponce } from "../utils/Apiresponce.js";


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
//   console.log(email, username, password);

  // Validation
  if (
    [email, username, password].some((field) => !field || field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  //checking if user already exits
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User With Email Or username alreasy exits");
  }

  //create user in db
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
  });

  //remove sensitive field from responce
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponce(200, "User Registerd Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //getiing data from req.body
  const { email, username, password } = req.body;

  if (!username && email) {
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

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponce(
        200,
        { 
            user: loggedInUser, accessToken, refreshToken
        },
        "User Logged in Successfully"
      )
    );
});
export { registerUser, loginUser };
