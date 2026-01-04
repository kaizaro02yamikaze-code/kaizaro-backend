import rateLimit from 'express-rate-limit';

export const aiRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per windowMs
    message: {
        success: false,
        error: "Rate limit exceeded. Try again later."
    },
    standardHeaders: true,
    legacyHeaders: false,
});