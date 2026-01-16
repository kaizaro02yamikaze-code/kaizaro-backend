import express from 'express';
const router = express.Router();

// GET /api/teacher/my-classes
router.get('/my-classes', (req, res) => {
    res.json([
        { batch: "JEE-Physics-A", students: 45, avgAttendance: "88%" },
        { batch: "NEET-Physics-B", students: 30, avgAttendance: "92%" }
    ]);
});

// GET /api/teacher/student-analysis
router.get('/student-analysis', (req, res) => {
    res.json({
        weakTopic: "Optics & Ray Diagrams",
        failingStudents: [
            { name: "Rohan Das", score: 35, prediction: "May fail next test" },
            { name: "Priya S.", score: 42, prediction: "Needs extra class" }
        ],
        aiSuggestion: "Schedule a remedial class for Optics on Saturday."
    });
});

export default router;