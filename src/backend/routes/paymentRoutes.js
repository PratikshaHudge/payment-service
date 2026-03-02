const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Payment = require("../models/Payment");

const router = express.Router();

// Razorpay Instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// -----------------------------
// CREATE ORDER
// -----------------------------
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || Number(amount) < 1) {
      return res.status(400).json({ success: false, message: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: Number(amount) * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    });

    console.log("ORDER CREATED:", order.id);
    res.json({ success: true, order });
  } catch (err) {
    console.error("RAZORPAY ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------
// VERIFY PAYMENT + SAVE TO DB
// -----------------------------
router.post("/verify", async (req, res) => {
  try {
    const { paymentId, orderId, signature, email, amount } = req.body;

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(orderId + "|" + paymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Signature mismatch" });
    }

    await Payment.create({
      email,
      amount: Number(amount),
      paymentId,
      orderId
    });

    console.log("PAYMENT SAVED IN DB ✅");
    res.json({ success: true });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------
// PAYMENT HISTORY
// -----------------------------
router.get("/history/:email", async (req, res) => {
  try {
    const payments = await Payment.find({ email: req.params.email })
      .sort({ date: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
