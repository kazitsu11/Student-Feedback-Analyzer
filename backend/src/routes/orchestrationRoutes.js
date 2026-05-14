const express = require("express");
const router = express.Router();
const { analyzeAll } = require("../controllers/orchestrationController");

router.get("/analyze", analyzeAll);

module.exports = router;
