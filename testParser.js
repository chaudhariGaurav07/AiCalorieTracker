import { parseMeal } from "./src/controllers/parser.controller.js";
import { Food } from "./src/models/Foods.model.js";
import { UnrecognizedFoodLog } from "./src/models/UnrecognizedFoodLog.model.js";

const mockFoods = [
  {
    name: "chapati",
    aliases: ["roti", "phulka", "padka"],
    baseUnit: "piece",
    nutrition: { calories: 80, protein: 3, carbs: 15, fat: 0 },
    unitConversions: new Map([["piece", 1]])
  },
  {
    name: "rice",
    aliases: ["chawal"],
    baseUnit: "bowl",
    nutrition: { calories: 200, protein: 4, carbs: 45, fat: 1 },
    unitConversions: new Map([["bowl", 1], ["plate", 2], ["katori", 0.5]])
  },
  {
    name: "dal makhani",
    aliases: ["dal"],
    baseUnit: "katori",
    nutrition: { calories: 150, protein: 7, carbs: 20, fat: 5 },
    unitConversions: new Map([["katori", 1], ["bowl", 2]])
  }
];

// Mock Mongoose Methods
Food.find = async () => mockFoods;
UnrecognizedFoodLog.create = async (doc) => {
    console.log("[MOCK DB] Unrecognized logged:", doc);
    return doc;
};

// Mock Express Req/Res
const mockReq = (text) => ({ body: { text } });
const mockRes = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    console.log("[Response Status: " + (res.statusCode || 200) + "] =>", JSON.stringify(data, null, 2));
    return data;
  };
  return res;
};

async function runTests() {
  console.log("--- TEST 1: Standard Input ---");
  await parseMeal(mockReq("2 chapati and 1 bowl rice"), mockRes());

  console.log("\n--- TEST 2: Unrecognized / Mistyped Input ---");
  await parseMeal(mockReq("1 katori dal + chappati + 1 glass water"), mockRes());

  console.log("\n--- TEST 3: Numbers as Words & Unmatched Tokens ---");
  await parseMeal(mockReq("two plates of rice with some randomfood"), mockRes());
  
  console.log("\n--- TEST 4: Missing Unit (Fallback to Base) ---");
  await parseMeal(mockReq("3 dal"), mockRes());
}

runTests().catch(console.error);
