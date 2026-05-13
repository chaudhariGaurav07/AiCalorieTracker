import { UnrecognizedFoodLog } from "../models/UnrecognizedFoodLog.model.js";
import { Food } from "../models/Foods.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { clearFoodCache, getCachedFoods } from "../utils/foodCache.js";
import { getCircuitStatus } from "../services/ml.service.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/Apiresponce.js";

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

// Manually refresh the memory cache
export const refreshCache = asyncHandler(async (req, res) => {
  await getCachedFoods(true);
  return res.status(200).json(
    new ApiResponce(200, null, "Food cache refreshed successfully across server")
  );
});

// Get ML Circuit Breaker Status
export const getMLStatus = asyncHandler(async (req, res) => {
  const status = getCircuitStatus();
  return res.status(200).json(
    new ApiResponce(200, status, "ML Status retrieved successfully")
  );
});

// --- Food Management CRUD ---

export const getFoods = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = "" } = req.query;
  const skip = (page - 1) * limit;
  const query = search ? { name: { $regex: search, $options: "i" } } : {};

  const foods = await Food.find(query)
    .sort({ name: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Food.countDocuments(query);

  res.status(200).json(
    new ApiResponce(200, {
      foods,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total
    }, "Foods fetched successfully")
  );
});

export const createFood = asyncHandler(async (req, res) => {
  const { name, aliases, nutrition, baseUnit, unitConversions } = req.body;

  if (!name || !nutrition || !baseUnit) {
    throw new ApiError(400, "Name, nutrition, and baseUnit are required");
  }

  const existing = await Food.findOne({ name });
  if (existing) throw new ApiError(400, "Food with this name already exists");

  const food = await Food.create({
    name,
    aliases: aliases || [],
    nutrition,
    baseUnit,
    unitConversions: unitConversions || { [baseUnit]: 1 }
  });

  clearFoodCache();
  res.status(201).json(new ApiResponce(201, food, "Food created successfully"));
});

export const updateFood = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const food = await Food.findByIdAndUpdate(id, updateData, { new: true });
  if (!food) throw new ApiError(404, "Food not found");

  clearFoodCache();
  res.status(200).json(new ApiResponce(200, food, "Food updated successfully"));
});

export const deleteFood = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const food = await Food.findByIdAndDelete(id);
  if (!food) throw new ApiError(404, "Food not found");

  clearFoodCache();
  res.status(200).json(new ApiResponce(200, null, "Food deleted successfully"));
});
