import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/Apiresponce.js";
import { DailyLog } from "../models/DailyLog.model.js";

/**
 * DELETE /api/v1/logs/entry/:index
 * Removes a single meal entry from today's log by its array index.
 */
export const deleteLogEntry = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const entryIndex = parseInt(req.params.index, 10);

  if (isNaN(entryIndex) || entryIndex < 0) {
    throw new ApiError(400, "Invalid entry index");
  }

  const today = new Date().toISOString().split("T")[0];
  const dailyLog = await DailyLog.findOne({ user: userId, date: today });

  if (!dailyLog) {
    throw new ApiError(404, "No log found for today");
  }

  if (entryIndex >= dailyLog.entries.length) {
    throw new ApiError(404, "Entry not found at the given index");
  }

  const removedEntry = dailyLog.entries[entryIndex];

  // Subtract removed entry from totals
  dailyLog.totals.calories = Math.max(0, dailyLog.totals.calories - (removedEntry.calories || 0));
  dailyLog.totals.protein = Math.max(0, dailyLog.totals.protein - (removedEntry.protein || 0));
  dailyLog.totals.carbs = Math.max(0, dailyLog.totals.carbs - (removedEntry.carbs || 0));
  dailyLog.totals.fats = Math.max(0, dailyLog.totals.fats - (removedEntry.fats || 0));

  dailyLog.entries.splice(entryIndex, 1);
  await dailyLog.save();

  return res.status(200).json(
    new ApiResponce(
      200,
      {
        entries: dailyLog.entries,
        totals: dailyLog.totals,
        removed: removedEntry,
      },
      "Meal entry deleted successfully"
    )
  );
});
