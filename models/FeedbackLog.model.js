import mongoose from "mongoose";

const feedbackLogSchema = new mongoose.Schema(
  {
    originalText: {
      type: String,
      required: true,
      trim: true
    },
    aiMatch: {
      foodName: String,
      foodId: mongoose.Schema.Types.ObjectId,
      score: Number
    },
    userCorrection: {
      foodName: String,
      foodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Food"
      }
    },
    context: {
      type: String, // e.g., "AMBIGUITY_RESOLUTION", "MANUAL_OVERRIDE"
      enum: ["AMBIGUITY_RESOLUTION", "MANUAL_OVERRIDE", "UNIT_CORRECTION"],
      default: "MANUAL_OVERRIDE"
    },
    resolved: {
      type: Boolean,
      default: false // Set to true once used for retraining/DB update
    }
  },
  { timestamps: true }
);

export const FeedbackLog = mongoose.model("FeedbackLog", feedbackLogSchema);
