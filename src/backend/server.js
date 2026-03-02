require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("Mongo Error:", err));

// Health Check
app.get("/", (req, res) => {
  res.send("Ripple AI Backend Running ✅");
});

// Routes
app.use("/api", paymentRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
