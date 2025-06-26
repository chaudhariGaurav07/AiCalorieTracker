import { CalorieGoal } from "../models/CalorieGoal.model.js";
import { DailyLog } from "../models/DailyLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { analyzeMeal } from "../utils/gptPrompt.js";
import { ApiResponce } from "../utils/Apiresponce.js";

 export const addMealEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { mealText } = req.body;

  if (!mealText || mealText.trim() === "") {
    throw new ApiError(400, "Meal text is required");
  }

  //Analyze meal using GPT
  const analysis = await analyzeMeal(mealText);
  const today = new Date().toISOString().split("T")[0];

  //created today's log
  const existingLog = await DailyLog.findOne({ user: userId, date: today });

  if (!existingLog) {
    await DailyLog.create({
      user: userId,
      date: today,
      entries: [{ mealText, ...analysis }],
      totals: { ...analysis },
    });
  } else {

    existingLog.entries.push({ mealText, ...analysis });

    existingLog.totals.calories += analysis.calories || 0;
    existingLog.totals.protein += analysis.protein || 0;
    existingLog.totals.carbs += analysis.carbs || 0;
    existingLog.totals.fats += analysis.fats || 0;

    await existingLog.save();
  }

  const calorieGoal = await CalorieGoal.findOne({user:userId})

  return res.status(200).json(
    new ApiResponce(200, {
        message: "Meal added successfully",
        entry: { mealText, ...analysis },
        today: {
          totals: existingLog?.totals || analysis,
          goal: calorieGoal || {},
      },
    })
  )
});
