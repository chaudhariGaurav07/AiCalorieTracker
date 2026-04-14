import { UnrecognizedFoodLog } from "../models/UnrecognizedFoodLog.model.js";
import { Food } from "../models/Foods.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clearFoodCache } from "../utils/foodCache.js";

// Fetch unrecognized logs
export const getUnrecognizedLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const logs = await UnrecognizedFoodLog.find({ resolved: false })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await UnrecognizedFoodLog.countDocuments({ resolved: false });

  res.status(200).json({
    success: true,
    logs,
    totalPages: Math.ceil(total / limit),
    currentPage: Number(page)
  });
});

// Approve an unrecognized log as an alias for an existing food
export const approveAlias = asyncHandler(async (req, res) => {
  const { logId, foodId } = req.body;

  if (!logId || !foodId) {
    return res.status(400).json({ success: false, message: "logId and foodId are required" });
  }

  const log = await UnrecognizedFoodLog.findById(logId);
  if (!log) {
    return res.status(404).json({ success: false, message: "Log not found" });
  }

  const food = await Food.findById(foodId);
  if (!food) {
    return res.status(404).json({ success: false, message: "Food item not found" });
  }

  // Add alias and save
  if (!food.aliases.includes(log.originalString)) {
    food.aliases.push(log.originalString);
    await food.save();
    
    // Invalidate Memory Cache since food dictionary changed
    clearFoodCache();
  }

  // Mark log as resolved
  log.resolved = true;
  await log.save();

  res.status(200).json({
    success: true,
    message: "Successfully added '" + log.originalString + "' as an alias to '" + food.name + "'"
  });
});

// Delete a junk log
export const deleteLog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const log = await UnrecognizedFoodLog.findByIdAndDelete(id);
  if (!log) {
    return res.status(404).json({ success: false, message: "Log not found" });
  }

  res.status(200).json({ success: true, message: "Log deleted successfully" });
});
