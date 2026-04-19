import { parseWithML } from "../services/ml.service.js";
import { parseMealText } from "./parser.controller.js";
import { DailyLog } from "../models/DailyLog.model.js";
import { Food } from "../models/Foods.model.js";
import { UnrecognizedFoodLog } from "../models/UnrecognizedFoodLog.model.js";
import { CalorieGoal } from "../models/CalorieGoal.model.js";
import { getCachedFoods } from "../utils/foodCache.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/Apiresponce.js";
import Fuse from "fuse.js";

const CONFIDENCE_HIGH = 0.85;
const CONFIDENCE_LOW = 0.6;

/**
 * Single entry point for all food-related NLP input.
 * The ML model decides the intent (ADD/REMOVE/UPDATE).
 */
export const processMealInput = asyncHandler(async (req, res) => {
  const text = req.body.text || req.body.mealText;

  if (!text || !text.trim()) {
    throw new ApiError(400, "Text input is required");
  }

  const startTime = Date.now();

  // ── Step 1: Call ML API (circuit breaker handles gating) ──
  const mlResult = await parseWithML(text);
  console.log("[ML DEBUG] Raw results:", mlResult?.results);

  let parsedData;
  let source = "ML";

  // ── Step 2: Intelligent Decision Engine (Confidence-based Hybrid Logic) ──
  if (!mlResult) {
    // Scenario 1: ML API is down or Circuit is Open → fallback to Rules
    const ruleResult = await parseMealText(text);
    parsedData = formatRuleResult(ruleResult, text);
    source = "RULE";
    
    // Log for retraining
    await logUnrecognized(text, "ML_DOWN_FALLBACK");
  } else {
    // Scenario 2: Evaluate ML Confidence
    // ML API returns results[].food_confidence. We take the average or minimum?
    // Let's check for any result below our threshold.
    const results = mlResult.results || [];
    const minConfidence = results.length > 0 ? Math.min(...results.map(r => r.food_confidence)) : 1;
    
    if (minConfidence < CONFIDENCE_LOW) {
      // Confidence too low → discard ML results, fallback to Rules
      const ruleResult = await parseMealText(text);
      parsedData = formatRuleResult(ruleResult, text);
      source = "RULE";
      await logUnrecognized(text, "LOW_CONFIDENCE_FALLBACK", minConfidence);
    } else if (minConfidence < CONFIDENCE_HIGH) {
      // Middling confidence (0.6 - 0.85) → Use ML but log for review (Hybrid)
      parsedData = mlResult;
      source = "ML"; // still ML, but we could tag as HYBRID if we had that enum
      await logUnrecognized(text, "MEDIUM_CONFIDENCE_REVIEW", minConfidence);
    } else {
      // High confidence → fully trust ML
      parsedData = mlResult;
      source = "ML";
    }
  }

  // ── Step 3: Persistence Logic ──
  const recognized = parsedData.results.filter((r) => r.status === "success");
  const unrecognized = parsedData.results.filter((r) => r.status === "unrecognized");

  if (unrecognized.length > 0) {
    for (const item of unrecognized) {
       await logUnrecognized(item.raw, "UNRECOGNIZED_ENTITY");
    }
  }

  if (recognized.length === 0) {
    throw new ApiError(400, "Could not identify any food items", [
      ...(unrecognized.map((u) => u.raw) || []),
      ...(parsedData._ruleUnmatched || []),
    ]);
  }

  const intent = parsedData.intent || "ADD";
  const userId = req.user._id;
  const today = new Date().toISOString().split("T")[0];

  const results = parsedData.results || [];
  const minConfidence = results.length > 0 ? Math.min(...results.map(r => r.food_confidence || 0)) : 0;
  const fallbackUsed = source === "RULE";
  const responseTime = `${Date.now() - startTime}ms`;

  let result;
  switch (intent) {
    case "ADD":
      result = await handleAddMeals(userId, today, recognized, source);
      break;
    case "REMOVE":
      result = await handleRemoveMeals(userId, today, recognized);
      break;
    case "UPDATE":
      result = await handleUpdateMeals(userId, today, recognized, source);
      break;
    default:
      result = await handleAddMeals(userId, today, recognized, source);
  }

  const calorieGoal = await CalorieGoal.findOne({ user: userId });

  return res.status(200).json(
    new ApiResponce(
      200,
      {
        message: `Meal successfully ${intent.toLowerCase()}ed`,
        intent,
        source,
        ...result,
        today: {
          totals: result.log?.totals || {},
          goal: calorieGoal || {},
        },
        metrics: {
          input: text,
          source,
          confidence: Number(minConfidence.toFixed(2)),
          fallbackUsed,
          responseTime
        },
        ...(unrecognized.length > 0 && {
          unrecognized: unrecognized.map((u) => u.raw),
        }),
      },
      `Meal ${intent.toLowerCase()} processed successfully`
    )
  );
});

// ──────────────────────────────────────────────
//  Helpers & Handlers
// ──────────────────────────────────────────────

function formatRuleResult(ruleResult, rawText) {
  return {
    intent: "ADD",
    results: ruleResult.parsed.map((r) => ({
      status: "success",
      food: r.food,
      quantity: r.quantity,
      unit: r.unit,
      food_confidence: 1.0, 
      spell_corrected: false,
      raw: rawText,
    })),
    _ruleUnmatched: ruleResult.unmatched,
    _ruleTotals: ruleResult.totals,
  };
}

async function logUnrecognized(text, reason, confidence = null) {
  try {
    await UnrecognizedFoodLog.create({
      originalString: text,
      reason: reason === "UNRECOGNIZED_ENTITY" ? "UNPARSEABLE" : "LOW_CONFIDENCE",
      // We could add more fields to UnrecognizedFoodLog if needed, 
      // but for now we'll stick to the existing schema or log to console
    });
    if (confidence !== null) {
       console.log(`[ML LOG] Storing input for retraining: "${text}" (Reason: ${reason}, Confidence: ${confidence.toFixed(2)})`);
    } else {
       console.log(`[ML LOG] Storing input for review: "${text}" (Reason: ${reason})`);
    }
  } catch (err) {
    console.error("Failed to log unrecognized food:", err.message);
  }
}

function parseNumericQuantity(qty) {
  if (typeof qty === "number") return qty;
  if (!qty) return 1;

  const textQty = qty.toString().toLowerCase().trim();
  const map = {
    "half": 0.5,
    "quarter": 0.25,
    "one": 1,
    "two": 2,
    "double": 2,
    "triple": 3
  };

  if (map[textQty] !== undefined) return map[textQty];

  const num = parseFloat(textQty);
  return isNaN(num) ? 1 : num;
}

async function lookupNutrition(foodName, rawQuantity, unit) {
  const quantity = parseNumericQuantity(rawQuantity);
  const foods = await getCachedFoods();
  const fuse = new Fuse(foods, {
    keys: ["name", "aliases"],
    threshold: 0.4,
    includeScore: true,
  });

  const matched = fuse.search(foodName);
  if (matched.length === 0 || matched[0].score > 0.4) {
    return { food: foodName, quantity, unit: unit || "piece", calories: 0, protein: 0, carbs: 0, fats: 0, matched: false };
  }

  const item = matched[0].item;
  let finalUnit = unit;
  let multiplier = 1;

  if (!finalUnit || !item.unitConversions || !item.unitConversions.get(finalUnit)) {
    finalUnit = item.baseUnit;
  }
  if (item.unitConversions && item.unitConversions.get(finalUnit)) {
    multiplier = item.unitConversions.get(finalUnit);
  }

  return {
    food: item.name,
    quantity,
    unit: finalUnit,
    calories: quantity * multiplier * (item.nutrition?.calories || 0),
    protein: quantity * multiplier * (item.nutrition?.protein || 0),
    carbs: quantity * multiplier * (item.nutrition?.carbs || 0),
    fats: quantity * multiplier * (item.nutrition?.fat || 0),
    matched: true,
  };
}

function formatMealText(quantity, unit, food) {
  const q = quantity || 1;
  let u = unit || "piece";
  
  // Format quantity to 1 decimal place if it's a float, but keep integers as is
  const displayQty = Number.isInteger(q) ? q : q.toFixed(1);

  // If unit starts with a number (e.g. "1 piece"), strip that number to avoid "0.5 1 piece"
  u = u.replace(/^\d+\s*/, "");

  return `${displayQty} ${u} ${food}`;
}

async function handleAddMeals(userId, date, foods, source) {
  const entries = [];
  let totalCalories = 0, totalProtein = 0, totalCarbs = 0, totalFats = 0;

  for (const f of foods) {
    const nutrition = await lookupNutrition(f.food, f.quantity, f.unit);
    entries.push({
      mealText: formatMealText(nutrition.quantity, nutrition.unit, nutrition.food),
      calories: Math.round(nutrition.calories),
      protein: Math.round(nutrition.protein),
      carbs: Math.round(nutrition.carbs),
      fats: Math.round(nutrition.fats),
      source: source,
      confidence: source === "RULE" ? 1.0 : (f.food_confidence || 0)
    });
    totalCalories += nutrition.calories;
    totalProtein += nutrition.protein;
    totalCarbs += nutrition.carbs;
    totalFats += nutrition.fats;
  }

  const log = await DailyLog.findOneAndUpdate(
    { user: userId, date },
    {
      $push: { entries: { $each: entries } },
      $inc: {
        "totals.calories": Math.round(totalCalories),
        "totals.protein": Math.round(totalProtein),
        "totals.carbs": Math.round(totalCarbs),
        "totals.fats": Math.round(totalFats),
      },
    },
    { new: true, upsert: true }
  );

  return { action: "added", entries, log };
}

async function handleRemoveMeals(userId, date, foods) {
  const dailyLog = await DailyLog.findOne({ user: userId, date });
  if (!dailyLog) throw new ApiError(404, "No meal log found for today");

  const removed = [];
  for (const f of foods) {
    const idx = dailyLog.entries.findIndex((entry) =>
      entry.mealText.toLowerCase().includes(f.food.toLowerCase())
    );

    if (idx !== -1) {
      const toRemove = dailyLog.entries[idx];
      removed.push({ food: f.food, removedEntry: toRemove.mealText, calories: toRemove.calories });
      dailyLog.totals.calories -= toRemove.calories;
      dailyLog.totals.protein -= toRemove.protein;
      dailyLog.totals.carbs -= toRemove.carbs;
      dailyLog.totals.fats -= toRemove.fats;
      dailyLog.entries.splice(idx, 1);
    } else {
      removed.push({ food: f.food, removedEntry: null, message: "No matching entry found" });
    }
  }
  await dailyLog.save();
  return { action: "removed", removed, log: dailyLog };
}

async function handleUpdateMeals(userId, date, foods, source) {
  const dailyLog = await DailyLog.findOne({ user: userId, date });
  if (!dailyLog) throw new ApiError(404, "No meal log found for today");

  const updated = [];
  for (const f of foods) {
    const idx = dailyLog.entries.findIndex((entry) =>
      entry.mealText.toLowerCase().includes(f.food.toLowerCase())
    );

    if (idx !== -1) {
      const oldEntry = dailyLog.entries[idx];
      const nutrition = await lookupNutrition(f.food, f.quantity, f.unit);
      const newEntry = {
        mealText: formatMealText(nutrition.quantity, nutrition.unit, nutrition.food),
        calories: Math.round(nutrition.calories),
        protein: Math.round(nutrition.protein),
        carbs: Math.round(nutrition.carbs),
        fats: Math.round(nutrition.fats),
        source: source,
        confidence: source === "RULE" ? 1.0 : (f.food_confidence || 0)
      };

      dailyLog.totals.calories += newEntry.calories - oldEntry.calories;
      dailyLog.totals.protein += newEntry.protein - oldEntry.protein;
      dailyLog.totals.carbs += newEntry.carbs - oldEntry.carbs;
      dailyLog.totals.fats += newEntry.fats - oldEntry.fats;
      dailyLog.entries[idx] = newEntry;

      updated.push({ food: f.food, oldEntry: oldEntry.mealText, newEntry: newEntry.mealText });
    } else {
      // Fallback add if not found
      const nutrition = await lookupNutrition(f.food, f.quantity, f.unit);
      const newEntry = {
        mealText: formatMealText(nutrition.quantity, nutrition.unit, nutrition.food),
        calories: Math.round(nutrition.calories),
        protein: Math.round(nutrition.protein),
        carbs: Math.round(nutrition.carbs),
        fats: Math.round(nutrition.fats),
        source: source,
        confidence: source === "RULE" ? 1.0 : (f.food_confidence || 0)
      };
      dailyLog.entries.push(newEntry);
      dailyLog.totals.calories += newEntry.calories;
      dailyLog.totals.protein += newEntry.protein;
      dailyLog.totals.carbs += newEntry.carbs;
      dailyLog.totals.fats += newEntry.fats;
      updated.push({ food: f.food, oldEntry: null, message: "Added as new entry" });
    }
  }
  await dailyLog.save();
  return { action: "updated", updated, log: dailyLog };
}
