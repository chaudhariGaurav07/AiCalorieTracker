import axios from "axios";

export const analyzeMeal = async (mealText) => {
  const prompt = `Estimate total calories, protein, carbs, and fats for the following meal.
Return ONLY in JSON format like:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fats": number
}

Meal: ${mealText}`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini", // ✅ you can also try gpt-3.5-turbo
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000", // 👈 required
          "X-Title": "calorie-tracker-ai",          // 👈 required
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonStart = content.indexOf("{");
    return JSON.parse(content.slice(jsonStart));
  } catch (error) {
    console.error(error?.response?.data || error.message);
    throw new Error("OpenRouter AI failed: " + error.message);
  }
};
