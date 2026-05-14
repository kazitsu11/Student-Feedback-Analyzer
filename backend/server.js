require('dotenv').config();
const mongoose=require("mongoose")
const express = require("express");
const connectDB=require("./src/config/db")
const analyticsRoutes=require("./src/routes/analyticsRoutes")
connectDB()

const app = express();
app.use(express.json());
app.use("/api",analyticsRoutes)

app.get("/", (req, res) => {
  res.json({
    message: "Backend running Successfully...",
  });
});

const feedbackRoutes=require("./src/routes/feedbackRoutes")
app.use("/api",feedbackRoutes);

const Port=5000
app.listen(Port, () => {
  console.log(`Server running on port ${Port}`);
});
