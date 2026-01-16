import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const MCQService = {
    async generateExam(subject, chapter, difficulty, count) {
        // Simple logic for now to fix the error
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `Generate ${count} ${difficulty} MCQs for ${subject} chapter ${chapter} in JSON format.`;
        
        try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // In production we parse JSON here, for now sending raw text to avoid crash
            return JSON.parse(text.replace(/```json|```/g, '')); 
        } catch (e) {
            console.error(e);
            throw new Error("AI Generation Failed");
        }
    }
};