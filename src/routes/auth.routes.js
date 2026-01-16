import express from 'express';
const router = express.Router();

// POST /api/auth/login - User Login logic
router.post('/login', (req, res) => {
    const { email, role } = req.body;
    
    // Real project mein yahan Database check hoga via Supabase
    // Abhi ke liye hum success return kar rahe hain
    res.status(200).json({
        message: "Login Successful",
        user: {
            id: "user_123",
            email: email,
            role: role,
            token: "fake-jwt-token"
        }
    });
});

// POST /api/auth/setup - Institute Setup logic
router.post('/setup', (req, res) => {
    const { instituteName, city, ownerId } = req.body;

    res.status(201).json({
        message: "Institute Created Successfully",
        institute: {
            id: "inst_8823",
            name: instituteName,
            city: city
        }
    });
});

export default router;