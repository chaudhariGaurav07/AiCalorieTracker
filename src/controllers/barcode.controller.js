
import axios from "axios";
import { DailyLog } from "../models/DailyLog.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/Apiresponce.js";

export const addMealFromBarcode = asyncHandler(async (req, res) => {
  const { barcode } = req.body;
  const userId = req.user._id;

  if (!barcode) {
    throw new ApiError(400, "Barcode is required");
  }

  
  const apiurl = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
  const { data } = await axios.get(apiurl);

  if (!data.product) {
    throw new ApiError(404, "Food item not found for this barcode");
  }

  const product = data.product;
  const mealText = product.product_name || "unknown product";

  const nutrients = product.nutriments || {};
  const calories = nutrients["energy-kcal"] || 0;
  const protein = nutrients.proteins || 0;
  const carbs = nutrients.carbohydrates || 0;
  const fats = nutrients.fat || 0;

  const entry = { mealText, calories, protein, carbs, fats, barcode };

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
    .json(new ApiResponce(200, log, "Meal added successfully from barcode"));
});
