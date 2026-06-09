import { Food } from "../models/Foods.model.js";

let cachedFoods = null;

export const getCachedFoods = async (forceRefresh = false) => {
  if (forceRefresh) {
    console.log("[CACHE FORCE] Refreshing foods from DB...");
    cachedFoods = null;
  }
  
  if (!cachedFoods) {
    console.log("[CACHE MISS] Fetching foods from DB...");
    cachedFoods = await Food.find();
  }
  return cachedFoods;
};

export const clearFoodCache = () => {
  console.log("[CACHE CLEARED] Food DB updated, invalidating memory cache.");
  cachedFoods = null;
};
