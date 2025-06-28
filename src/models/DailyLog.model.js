import mongoose, { Schema } from "mongoose";

const entrySchema = new Schema(
  {
    mealText: {
      type: String,
      required: true,
    },
    calories: {
      type: Number,
      required: true,
    },
    protein: {
      type: Number,
      default: 0,
    },
    carbs: {
      type: Number,
      default: 0,
    },
    fats: {
      type: Number,
      default: 0,
    },
    image:{
      type: String
    }
  },
  { _id: false }
);

const dailyLogSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    entries: [entrySchema],
    totals: {
      calories: {
        type: Number,
        default: 0,
      },
      protein: {
        type: Number,
        default: 0,
      },
      carbs: {
        type: Number,
        default: 0,
      },
      fats: {
        type: Number,
        default: 0,
      },

    },
  },
  { timestamps: true }
);

dailyLogSchema.index(
  {
    user: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

export const DailyLog = mongoose.model("DailyLog", dailyLogSchema);
