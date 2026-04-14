import { Food } from "../models/Foods.model.js";

//add multiple foods
export const addFoods = async (req, res) => {
  try {
    const foods = req.body;

    if (!Array.isArray(foods)) {
      return res.status(400).json({
        success: false,
        message: "Data must be an array"
      });
    }

    // Filter out foods with duplicate names already in DB
    const names = foods.map(f => f.name);
    const existingFoods = await Food.find({ name: { $in: names } }, 'name');
    const existingNames = new Set(existingFoods.map(f => f.name));
    const foodsToInsert = foods.filter(f => !existingNames.has(f.name));

    if (foodsToInsert.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No new foods to add. All names already exist.",
        count: 0
      });
    }

    const insertedFoods = await Food.insertMany(foodsToInsert, { ordered: false });

    res.status(201).json({
      success: true,
      message: "Foods added successfully (duplicates skipped)",
      count: insertedFoods.length
    });

  } catch (error) {
    // If error is duplicate key, still return success for inserted ones
    if (error.code === 11000 || error.writeErrors) {
      return res.status(201).json({
        success: true,
        message: "Some foods were skipped due to duplicates.",
        error: error.message
      });
    }
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error adding foods",
      error: error.message
    });
  }
};