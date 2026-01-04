import express from "express";
const router = express.Router();

// Teacher dashboard test
router.get("/test", (req, res) => {
  res.json({
    role: "teacher",
    status: "Teacher route working"
  });
});

// Example: create test
router.post("/create-test", (req, res) => {
  res.json({ message: "Test created (dummy)" });
});

export default router;
