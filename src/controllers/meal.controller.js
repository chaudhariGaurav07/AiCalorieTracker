
import { DailyLog } from "../models/DailyLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/Apiresponce.js";
import { analyzeMeal } from "../utils/gptPrompt.js";

export const editMealEntry = asyncHandler(async (req, res) => {
  const { date, index } = req.params;
  const { mealText, calories, protein, carbs, fats } = req.body;
  const userId = req.user._id;

  const dailyLog = await DailyLog.findOne({ user: userId, date });
  if (!dailyLog || !dailyLog.entries[index]) {
    throw new ApiError(404, "Meal entry not found");
  }

  // Remove old values from totals
  const old = dailyLog.entries[index];
  dailyLog.totals.calories -= old.calories;
  dailyLog.totals.protein -= old.protein;
  dailyLog.totals.carbs -= old.carbs;
  dailyLog.totals.fats -= old.fats;

  // Update meal
  dailyLog.entries[index] = { mealText, calories, protein, carbs, fats };

  // Add new values
  dailyLog.totals.calories += calories;
  dailyLog.totals.protein += protein;
  dailyLog.totals.carbs += carbs;
  dailyLog.totals.fats += fats;

  await dailyLog.save();

  res.status(200).json(new ApiResponce(200, dailyLog, "Meal updated successfully"));
});

export const deleteMealEntry = asyncHandler(async (req, res) => {
    const { date, index } = req.params;
    const userId = req.user._id;
  
    const dailyLog = await DailyLog.findOne({ user: userId, date });
    if (!dailyLog || !dailyLog.entries[index]) {
      throw new ApiError(404, "Meal entry not found");
    }
  
    const toDelete = dailyLog.entries[index];
  
    // Remove from entries and update totals
    dailyLog.entries.splice(index, 1);
    dailyLog.totals.calories -= toDelete.calories;
    dailyLog.totals.protein -= toDelete.protein;
    dailyLog.totals.carbs -= toDelete.carbs;
    dailyLog.totals.fats -= toDelete.fats;
  
    await dailyLog.save();
  
    res.status(200).json(new ApiResponce(200, dailyLog, "Meal deleted successfully"));
  });
  
  export const addMealWithPhoto = asyncHandler(async (req, res) => {
    const { mealText } = req.body;
    const image = req.file?.path;
    const userId = req.user._id;
  
    if (!req.file?.path) {
      throw new ApiError(400, "Image upload failed");
    }
    
    if (!mealText) {
      throw new ApiError(400, "Meal text is required");
    }
  
    const { calories, protein, carbs, fats } = await analyzeMeal(mealText);
  
    const entry = {
      mealText,
      calories,
      protein,
      carbs,
      fats,
      image, // cloudinary url
    };
  
    const today = new Date().toISOString().split("T")[0];
  
    const log = await DailyLog.findOneAndUpdate(
      { user: userId, date: today },
      {
        $push: { entries: entry },
        $inc: {
          "totals.calories": calories,
          "totals.protein": protein,
          "totals.carbs": carbs,
          "totals.fats": fats,
        },
      },
      { new: true, upsert: true }
    );
  
    return res
      .status(200)
      .json(new ApiResponce(200, log, "Meal added successfully with photo"));
  });