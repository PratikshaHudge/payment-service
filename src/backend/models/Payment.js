const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  email: String,
  amount: Number,
  paymentId: String,
  orderId: String,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
