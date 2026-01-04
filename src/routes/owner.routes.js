import express from "express";
const router = express.Router();

// Owner dashboard test
router.get("/test", (req, res) => {
  res.json({
    role: "owner",
    status: "Owner route working"
  });
});

// Example: platform stats
router.get("/stats", (req, res) => {
  res.json({
    students: 120,
    teachers: 10,
    revenue: "₹0 (demo)"
  });
});

export default router;
