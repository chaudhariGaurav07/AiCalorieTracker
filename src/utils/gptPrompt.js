import axios from "axios";

//Simple in-memory cache (reset when server restarts)
const mealCache = new Map();

export const analyzeMeal = async (mealText) => {
  const normalized = mealText.trim().toLowerCase();

  //Check if meal is already cached
  if (mealCache.has(normalized)) {
    return mealCache.get(normalized);
  }

  const prompt = `Estimate total calories, protein, carbs, and fats for the following meal.
Return ONLY in JSON format like:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number
}

Meal: ${normalized}`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0, // ensures same input → same output
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "calorie-tracker-ai",
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonStart = content.indexOf("{");
    const result = JSON.parse(content.slice(jsonStart));

    // Save in cache
    mealCache.set(normalized, result);

    return result;
  } catch (error) {
    console.error(error?.response?.data || error.message);
    throw new Error("OpenRouter AI failed: " + error.message);
  }
};
