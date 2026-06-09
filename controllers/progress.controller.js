import { CalorieGoal } from "../models/CalorieGoal.model.js";
import { DailyLog } from "../models/DailyLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponce } from "../utils/Apiresponce.js";


export const getDailyProgress = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = new Date().toISOString().split("T")[0];

  const dailyLog = await DailyLog.findOne({
    user: userId,
    date: today,
  });

  const goal = await CalorieGoal.findOne({
    user: userId,
  });

  if (!goal) {
    throw new ApiError(404, "Goal not set");
  }

  const totals = dailyLog?.totals || {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  };

  const progress = {
    calories: Math.min(
      Math.round((totals.calories / goal.targetCalories) * 100),
      100
    ),
    protein: Math.min(
      Math.round((totals.protein / goal.proteinGoal) * 100),
      100
    ),
    carbs: Math.min(Math.round((totals.carbs / goal.carbGoal) * 100), 100),
    fats: Math.min(Math.round((totals.fats / goal.fatGoal) * 100), 100),
  };

  return res
    .status(200)
    .json(
      new ApiResponce(
        200,
        { progress, totals, goal },
        "Progress fetched successfully"
      )
    );
});
