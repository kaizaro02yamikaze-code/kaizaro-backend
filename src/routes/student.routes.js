const express = require("express"); // import ki jagah require
const router = express.Router();

// Student dashboard test
router.get("/test", (req, res) => {
  res.json({
    role: "student",
    status: "Student route working"
  });
});

// Example: get progress
router.get("/progress", (req, res) => {
  res.json({
    progress: "50%",
    message: "Dummy progress data"
  });
});

module.exports = router; // export default ki jagah module.exports