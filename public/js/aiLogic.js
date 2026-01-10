
// AI Logic for Risk and Recommendations

const AICore = {

    // Calculate Student Risk Level
    calculateRisk: (score) => {
        if (score < 40) return 'HIGH';
        if (score >= 40 && score <= 60) return 'MEDIUM';
        return 'LOW';
    },

    // Analyze Batch Health
    analyzeBatchHealth: (avgScore) => {
        if (avgScore < 60) return 'LAGGING';
        if (avgScore >= 60 && avgScore < 75) return 'STABLE';
        return 'EXCELLENT';
    },

    // Generate Student Recommendations
    // attempts: array of { question: { topic: string }, is_correct: boolean }
    getRecommendations: (answers) => {
        const topicAnalysis = {};

        answers.forEach(ans => {
            // Assuming ans.question has a 'topic' field or we join it
            const topic = ans.topic || 'General';
            if (!topicAnalysis[topic]) topicAnalysis[topic] = { total: 0, wrong: 0 };

            topicAnalysis[topic].total++;
            if (!ans.is_correct) topicAnalysis[topic].wrong++;
        });

        // Find weak topics
        const weakTopics = [];
        for (const [topic, stats] of Object.entries(topicAnalysis)) {
            const wrongPercentage = (stats.wrong / stats.total) * 100;
            if (wrongPercentage > 40) { // If > 40% wrong, specific revision needed
                weakTopics.push({ topic, wrongPercentage });
            }
        }

        // Sort by weakness
        weakTopics.sort((a, b) => b.wrongPercentage - a.wrongPercentage);

        const recommendations = weakTopics.map(t => `Revise ${t.topic}: You missed ${Math.round(t.wrongPercentage)}% of questions.`);

        if (recommendations.length === 0) return ["Great job! Keep practicing advanced topics."];
        return recommendations;
    },

    // Teacher Alerts
    // students: array of { name, risk_level }
    getTeacherAlerts: (students) => {
        const highRisk = students.filter(s => s.risk_level === 'HIGH');
        if (highRisk.length > 0) {
            return `Attention: ${highRisk.length} students are at High Risk. Schedule a remedial session.`;
        }
        return "Class performance is vital.";
    }
};

window.AICore = AICore;
