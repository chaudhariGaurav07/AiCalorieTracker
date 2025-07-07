  import { DailyLog } from "../models/DailyLog.model.js";
  import { asyncHandler } from "../utils/asyncHandler.js";
  import { ApiError } from "../utils/ApiError.js";
  import { ApiResponce } from "../utils/Apiresponce.js";


  export const logStepCount = asyncHandler(async (req, res) => {
    const { steps } = req.body;
    const userId = req.user._id;

    if (!steps || isNaN(steps) || steps < 0) {
      throw new ApiError(400, "Valid step count is required");
    }

    const caloriesBurned = parseFloat((steps * 0.04).toFixed(2));
    const today = new Date().toISOString().split("T")[0];

    const log = await DailyLog.findOneAndUpdate(
      {
        user: userId,
        date: today,
      },
      {
        $set: {
          stepCount: steps,
          burnedCalories: caloriesBurned,
        },
        $inc: {
          "totals.calories": -caloriesBurned,
        },
      },
      { new: true, upsert: true }
    );

    res
      .status(200)
      .json(
        new ApiResponce(200, log, "Step count logged and calories burned updated")
      );
  });
