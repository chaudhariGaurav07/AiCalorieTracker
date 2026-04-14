import { Food } from "../models/Foods.model.js";

export const parseMeal = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const foods = await Food.find();
    const input = text.toLowerCase();

    const results = [];

    // Parse
    for (let food of foods) {
      const names = [food.name, ...food.aliases];

      for (let name of names) {
        if (input.includes(name)) {

          const regex = new RegExp(`(\\d+)\\s*(\\w+)?\\s*${name}`);
          const match = input.match(regex);

          let quantity = 1;
          let unit = food.baseUnit;

          if (match) {
            quantity = parseInt(match[1]);
            if (match[2]) unit = match[2];
          }

          results.push({
            food: food.name,
            quantity,
            unit
          });

          break;
        }
      }
    }

     
    let totalCalories = 0;
    let totalProtein = 0;

    results.forEach(item => {
      const food = foods.find(f => f.name === item.food);

      if (!food) return;

      let multiplier = 1;

      // handle unit
      if (food.unitConversions.get(item.unit)) {
        multiplier = food.unitConversions.get(item.unit);
      }

      totalCalories += item.quantity * multiplier * food.nutrition.calories;
      totalProtein += item.quantity * multiplier * food.nutrition.protein;
    });

    // Final Response
    res.json({
      success: true,
      parsed: results,
      totals: {
        calories: totalCalories,
        protein: totalProtein
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Parsing error" });
  }
};