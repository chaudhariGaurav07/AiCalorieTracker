import { Food } from "../models/Foods.model.js";
import { UnrecognizedFoodLog } from "../models/UnrecognizedFoodLog.model.js";
import { getCachedFoods } from "../utils/foodCache.js";
import Fuse from "fuse.js";
import { wordsToNumbers } from "words-to-numbers";

const COMMON_UNITS = [
  "plate", "plates", "bowl", "bowls", "katori", "cup", "cups", 
  "tbsp", "piece", "pieces", "gram", "grams", "kg", 
  "glass", "glasses", "pc", "pcs"
];

// Extracted internal function to be reused by other controllers
export const parseMealText = async (text) => {
  if (!text) throw new Error("Text is required");

  // Fetch from RAM cache (or hit DB once if cache miss)
  const foods = await getCachedFoods();
  
  const fuseOptions = {
    keys: ["name", "aliases"],
    threshold: 0.4,
    includeScore: true,
  };
  const fuse = new Fuse(foods, fuseOptions);

  let input = text.toLowerCase();
  
  let convertedWords = wordsToNumbers(input, { impliedHundreds: true });
  input = convertedWords ? convertedWords.toString() : input;

  const parts = input.split(/(?:\s+\+\s+|\s+and\s+|,|&|\s+with\s+)/).map(p => p.trim()).filter(Boolean);

  const results = [];
  const unmatchedItems = [];
  
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const part of parts) {
    let quantity = 1;
    let unit = "";
    let foodNameString = part;

    const qtyRegex = /([\d.]+)\s*([a-zA-Z]+)?/;
    const match = foodNameString.match(qtyRegex);

    if (match) {
      quantity = parseFloat(match[1]);
      if (match[2] && COMMON_UNITS.includes(match[2])) {
        unit = match[2];
        if (unit.endsWith('s') && unit !== 'glass') unit = unit.slice(0, -1);
        if (unit === 'glasses') unit = 'glass';
        foodNameString = foodNameString.replace(match[0], "").trim();
      } else {
        foodNameString = foodNameString.replace(match[1], "").trim();
      }
    }

    if (!unit) {
       for (let possibleUnit of COMMON_UNITS) {
           const unitRegex = new RegExp(`\\b${possibleUnit}\\b`, 'i');
           if (unitRegex.test(foodNameString)) {
               unit = possibleUnit;
               if (unit.endsWith('s') && unit !== 'glass') unit = unit.slice(0, -1);
               if (unit === 'glasses') unit = 'glass';
               foodNameString = foodNameString.replace(unitRegex, "").trim();
               break;
           }
       }
    }
    
    foodNameString = foodNameString.replace(/^(of|a|an)\s+/ig, "").trim();

    if (!foodNameString) continue;

    const matched = fuse.search(foodNameString);
    
    if (matched.length > 0 && matched[0].score <= 0.4) {
      const item = matched[0].item;
      
      let finalUnit = unit;
      let multiplier = 1;
      
      if (!finalUnit || !item.unitConversions || !item.unitConversions.get(finalUnit)) {
         finalUnit = item.baseUnit;
      }

      if (item.unitConversions && item.unitConversions.get(finalUnit)) {
         multiplier = item.unitConversions.get(finalUnit);
      }

      results.push({
        food: item.name,
        quantity,
        unit: finalUnit
      });

      totalCalories += quantity * multiplier * (item.nutrition?.calories || 0);
      totalProtein += quantity * multiplier * (item.nutrition?.protein || 0);
      totalCarbs += quantity * multiplier * (item.nutrition?.carbs || 0);
      totalFat += quantity * multiplier * (item.nutrition?.fat || 0);

    } else {
      // Compound food matching fallback: split the unrecognized food by spaces (e.g. "dal sabji" -> "dal" & "sabji")
      const words = foodNameString.split(/\s+/).map(w => w.trim()).filter(Boolean);
      let splitSuccess = false;

      if (words.length > 1) {
        const subMatched = [];
        for (const word of words) {
          const subMatch = fuse.search(word);
          if (subMatch.length > 0 && subMatch[0].score <= 0.4) {
            subMatched.push(subMatch[0].item);
          }
        }
        // If all individual words matched valid foods in the DB, process them all
        if (subMatched.length === words.length) {
          for (const item of subMatched) {
            let finalUnit = unit;
            let multiplier = 1;
            
            if (!finalUnit || !item.unitConversions || !item.unitConversions.get(finalUnit)) {
               finalUnit = item.baseUnit;
            }

            if (item.unitConversions && item.unitConversions.get(finalUnit)) {
               multiplier = item.unitConversions.get(finalUnit);
            }

            results.push({
              food: item.name,
              quantity,
              unit: finalUnit
            });

            totalCalories += quantity * multiplier * (item.nutrition?.calories || 0);
            totalProtein += quantity * multiplier * (item.nutrition?.protein || 0);
            totalCarbs += quantity * multiplier * (item.nutrition?.carbs || 0);
            totalFat += quantity * multiplier * (item.nutrition?.fat || 0);
          }
          splitSuccess = true;
        }
      }

      if (!splitSuccess) {
        unmatchedItems.push(foodNameString);
        try {
            await UnrecognizedFoodLog.create({
               originalString: part,
               reason: matched.length > 0 ? 'LOW_CONFIDENCE' : 'UNPARSEABLE'
            });
        } catch (dbErr) {
            console.error("Failed to log unrecognized food:", dbErr.message);
        }
      }
    }
  }

  return {
    parsed: results,
    unmatched: unmatchedItems,
    totals: {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fats: totalFat
    }
  };
};

// Express Route Controller
export const parseMeal = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Text is required" });
    }

    const data = await parseMealText(text);

    return res.json({
      success: true,
      ...data
    });

  } catch (error) {
    console.error("Parser Error:", error);
    return res.status(500).json({ message: "Parsing error internal" });
  }
};