import express from 'express';
const router = express.Router();

// GET /api/student/profile
router.get('/profile', (req, res) => {
    res.json({
        name: "Vikram Singh",
        batch: "JEE-A",
        attendance: 78,
        feesDue: 5000
    });
});

// GET /api/student/ai-plan
router.get('/ai-plan', (req, res) => {
    res.json({
        todaysGoal: "Revise Thermodynamics",
        weakAreas: ["Calculus", "Organic Chemistry"],
        aiTip: "Your mock test score in Math dropped. Spend 30 mins on Calculus formulas today."
    });
});

export default router;