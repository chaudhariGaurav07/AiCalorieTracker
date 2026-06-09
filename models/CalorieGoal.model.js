import mongoose, { Schema } from "mongoose";

const calorieGoalSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    height: {
      type: Number, // in cm
      required: true,
    },
    weight: {
      type: Number, // in kg
      required: true,
    },
    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active", "very active"],
      required: true,
    },
    goalType: {
      type: String,
      enum: ["gain", "maintain", "loss"],
      default: "maintain",
    },
    targetCalories: {
      type: Number,
      required: true,
    },
    proteinGoal: Number, // in grams (optional)
    fatGoal: Number,
    carbGoal: Number,
  },
  { timestamps: true }
);

export const CalorieGoal = mongoose.model("CalorieGoal", calorieGoalSchema);
