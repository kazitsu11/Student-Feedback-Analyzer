const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const analyticsRoutes = require("./src/routes/analyticsRoutes");
const feedbackRoutes = require("./src/routes/feedbackRoutes");
const orchestrationRoutes = require("./src/routes/orchestrationRoutes");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend running Successfully..." });
});

app.use("/api", analyticsRoutes);
app.use("/api", feedbackRoutes);
app.use("/api", orchestrationRoutes);

const Port = process.env.PORT || 5000;
app.listen(Port, () => {
  console.log(`Server running on port ${Port}`);
});
