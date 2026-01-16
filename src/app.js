import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
