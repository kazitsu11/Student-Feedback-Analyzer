const express = require("express");
const router = express.Router();
const { analyzeAll, runEvaluation } = require("../controllers/orchestrationController");

router.get("/analyze", analyzeAll);
router.get("/evaluate", runEvaluation);

module.exports = router;
