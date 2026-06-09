import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true , unique: true},

  aliases: [String],

  baseUnit: String,

  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number
  },

  unitConversions: {
    type: Map,
    of: Number
  }
});

export const Food = mongoose.model('Food', foodSchema);