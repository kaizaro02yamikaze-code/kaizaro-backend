import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || 'placeholder-key';
if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  WARNING: GEMINI_API_KEY not found in .env');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const MCQService = {
    async generateExam(subject, chapter, difficulty, count = 5) {
        try {
            // Simple logic for now to fix the error
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const prompt = `Generate ${count} ${difficulty} MCQs for ${subject} chapter ${chapter} in JSON format. Each MCQ should have: question, options (array of 4), correct_answer_index.`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            
            // In production we parse JSON here, for now sending raw text to avoid crash
            return JSON.parse(text.replace(/```json|```/g, '')); 
        } catch (e) {
            console.error('MCQ Generation Error:', e.message);
            throw new Error("AI Generation Failed: " + e.message);
        }
    }
};

export default MCQService;