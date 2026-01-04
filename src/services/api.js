import express from 'express';
import { checkRole } from '../src/middleware/roleAuth.js'; // Your existing middleware
import { aiRateLimiter } from '../src/middleware/rateLimiter.js'; // The new middleware
import { MCQService } from '../src/services/mcq.service.js'; // Assuming you moved this

const router = express.Router();

/**
 * PROTECTED ROUTE: Generate MCQs
 * Security Level: High (Auth + Role + Rate Limit)
 */
router.post('/generate-exam', 
    aiRateLimiter,          // 1. Check if they are spamming
    checkRole(['TEACHER']), // 2. Check if they are a Teacher
    async (req, res) => {
        try {
            const { subject, chapter, difficulty } = req.body;
            
            // Your Service Logic
            const questions = await MCQService.generateExam(subject, chapter, difficulty);
            
            res.json({ success: true, data: questions });

        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
);

export default router;