import express from 'express';
const router = express.Router();

// GET /api/owner/dashboard - Main KPI Data
router.get('/dashboard', (req, res) => {
    // Ye data Supabase se calculate hoke aayega
    const dashboardData = {
        totalRevenue: 1250000,
        collected: 850000,
        pendingFees: 400000,
        totalStudents: 450,
        activeBatches: 12,
        highRiskCount: 15
    };
    res.json(dashboardData);
});

// GET /api/owner/risk-report - AI Risk Analysis
router.get('/risk-report', (req, res) => {
    const risks = [
        { name: "Vikram Singh", risk: "High", reason: "Fees pending > 60 days", action: "Call Parents" },
        { name: "Amit Kumar", risk: "Medium", reason: "Attendance < 60%", action: "Warning SMS" }
    ];
    res.json(risks);
});

export default router;