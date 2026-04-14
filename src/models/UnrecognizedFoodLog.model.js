import mongoose from 'mongoose';

const unrecognizedFoodLogSchema = new mongoose.Schema({
  originalString: { 
    type: String, 
    required: true 
  },
  reason: {
    type: String,
    enum: ['LOW_CONFIDENCE', 'UNPARSEABLE', 'OTHER'],
    default: 'OTHER'
  },
  resolved: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const UnrecognizedFoodLog = mongoose.model('UnrecognizedFoodLog', unrecognizedFoodLogSchema);
