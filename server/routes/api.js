const express = require("express");
const router = express.Router();
const aiController = require("../controller/aiController");

router.post("/ask", aiController.askQuestion);
router.post("/add-debug-prints", aiController.addDebugPrints);

module.exports = router;
