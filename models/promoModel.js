const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  show: {
    type: Boolean,
    default: "false",
  },

  days: { type: Number, default: 0 },
  hours: { type: Number, default: 0 },
  minutes: { type: Number, default: 0 },
  percentages: { type: Number, default: 0 },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Promo", promoSchema);
