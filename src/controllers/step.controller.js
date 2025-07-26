import { DailyLog } from "../models/DailyLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/Apiresponce.js";

export const logStepCount = asyncHandler(async (req, res) => {
  const { steps } = req.body;
  const userId = req.user._id;

  if (steps === undefined || isNaN(steps) || steps < 0) {
    throw new ApiError(400, "Valid step count is required");
  }

  const today = new Date().toISOString().split("T")[0];

  // Fetch existing log to calculate delta
  const existingLog = await DailyLog.findOne({
    user: userId,
    date: today,
  });

  const previousSteps = existingLog?.stepCount || 0;
  const stepDifference = steps - previousSteps;

  if (stepDifference <= 0) {
    return res.status(200).json(
      new ApiResponce(200, existingLog, "No new steps to update")
    );
  }

  const caloriesToAdd = parseFloat((stepDifference * 0.04).toFixed(2));

  const updatedLog = await DailyLog.findOneAndUpdate(
    {
      user: userId,
      date: today,
    },
    {
      $set: { stepCount: steps },
      $inc: {
        burnedCalories: caloriesToAdd,
        "totals.calories": -caloriesToAdd,
      },
    },
    { new: true, upsert: true }
  );

  res.status(200).json(
    new ApiResponce(200, updatedLog, "Steps and calories updated successfully")
  );
});
