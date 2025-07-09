import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponce } from "../utils/Apiresponce.js";
import { ApiError } from "../utils/ApiError.js";
import { DailyLog } from "../models/DailyLog.model.js";
import { CalorieGoal } from "../models/CalorieGoal.model.js";

export const getTodayLog = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "user not found");
  }

  const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  const dailyLog = await DailyLog.findOne({ user: userId, date: today });
  const calorieGoal = await CalorieGoal.findOne({ user: userId });

  return res.status(200).json(
    new ApiResponce(
      200,
      {
        entries: dailyLog?.entries || [],
        totals: dailyLog?.totals || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
        },
        calorieGoal: calorieGoal || null,
        stepCount: dailyLog?.stepCount || 0,           // ✅ Add this
        burnedCalories: dailyLog?.burnedCalories || 0, // ✅ And this
      },
      "Today's log fetched successfully"
    )
  );
});
