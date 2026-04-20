import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const foodSchema = new mongoose.Schema({ 
  name: String, 
  baseUnit: String, 
  unitConversions: { type: Map, of: Number } 
});
const Food = mongoose.model("Food", foodSchema);

async function audit() {
  await mongoose.connect(process.env.MONGODB_URI);
  const foods = await Food.find({});
  let issues = 0;

  console.log("--- Starting Food Database Audit ---");
  foods.forEach(f => {
    // Check if unitConversions exists and if the multiplier for the baseUnit is not 1
    if (f.unitConversions && f.unitConversions.get(f.baseUnit) && f.unitConversions.get(f.baseUnit) !== 1) {
      console.warn("⚠️  UNIT RISK FOUND:", f.name);
      console.warn("   -> BaseUnit is '" + f.baseUnit + "' but multiplier is " + f.unitConversions.get(f.baseUnit));
      console.warn("   -> Fix: Change baseUnit to '1 piece' and adjust nutrition.");
      issues++;
    }
  });

  if (issues === 0) {
    console.log("✅ DATABASE CLEAN: No unit risks found.");
  } else {
    console.warn("Found " + issues + " potential math risks.");
  }
  process.exit(0);
}
audit();
