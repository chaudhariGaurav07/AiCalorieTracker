require("dotenv").config();
const mongoose = require("mongoose");
const Fuse = require("fuse.js");

// Mocking the normalization and lookup logic
const normalize = (str) => str.toLowerCase().replace(/[\s-]/g, "");

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Define Schema
  const Food = mongoose.model("Food", new mongoose.Schema({ name: String, aliases: [String] }));
  
  const foods = await Food.find({});
  const foodName = "pavbhaji";
  const normalizedInput = normalize(foodName);

  console.log("Searching for:", foodName);
  console.log("Total foods in DB:", foods.length);

  const exactMatch = foods.find(f => 
    normalize(f.name) === normalizedInput || 
    (f.aliases && f.aliases.some(a => normalize(a) === normalizedInput))
  );

  if (exactMatch) {
    console.log("✅ SUCCESS: Exact Space-Blind Match Found:", exactMatch.name);
  } else {
    console.log("❌ FAILURE: No Exact Match.");
    const fuse = new Fuse(foods, { keys: ["name", "aliases"], threshold: 0.4, includeScore: true });
    const matched = fuse.search(foodName);
    if (matched.length > 0) {
       console.log("Fuzzy Match found:", matched[0].item.name, "Score:", matched[0].score);
    } else {
       console.log("No fuzzy match either.");
    }
  }
  process.exit(0);
}
test();
