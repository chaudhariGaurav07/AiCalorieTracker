import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/Apiresponce.js";
import { calculateCalories } from "../utils/calculateCalories.js";
import { CalorieGoal } from "../models/CalorieGoal.model.js";

const setOrUpdateCalorieGoal = asyncHandler(async (req, res) => {

  const { gender, age, height, weight, activityLevel, goalType } = req.body;

  if (!gender || !age || !height || !weight || !activityLevel || !goalType) {
    throw new ApiError(400, "All fields are required");
  }

  const userId = req.user._id;

  const goals = calculateCalories({
    gender,
    age,
    height,
    weight,
    activityLevel,
    goalType,
  });

  const updatedGoal = await CalorieGoal.findOneAndUpdate(
    { user: userId },
    {
      gender,
      age,
      height,
      weight,
      activityLevel,
      goalType,
      ...goals,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        updatedGoal,
        "Calorie goal calculated and saved successfully"
      )
    );
});

const getCalorieGoal = asyncHandler(async (req, res) => {
    const goal = await CalorieGoal.findOne({user: req.user._id})

    if (!goal) {
        throw new ApiError(404, "Calorie goal not found for this user");
      }

      return res
    .status(200)
    .json(new ApiResponce(200, goal, "Goal fetched successfully"));
});

export { setOrUpdateCalorieGoal, getCalorieGoal };