import { Question } from '../store/candidatesSlice';
import { v4 as uuidv4 } from 'uuid';

const questionBank = {
  easy: [
    "What is the difference between var, let, and const in JavaScript?",
    "Explain what React components are and how they work.",
    "What is the purpose of the useState hook in React?",
    "What is the difference between == and === in JavaScript?",
    "What is npm and what is it used for?",
    "Explain the concept of the virtual DOM in React.",
  ],
  medium: [
    "Explain the concept of closures in JavaScript with an example.",
    "What are React hooks and why were they introduced? Name at least 3 hooks.",
    "How does asynchronous programming work in JavaScript? Explain Promises.",
    "What is the difference between REST and GraphQL?",
    "Explain the event loop in JavaScript and how it handles asynchronous operations.",
    "What are controlled and uncontrolled components in React?",
  ],
  hard: [
    "Design a scalable Node.js application architecture for handling 10,000+ concurrent users.",
    "Explain React's reconciliation algorithm and how it optimizes re-renders.",
    "Implement a debounce function from scratch and explain when you'd use it.",
    "How would you optimize a React application for performance? Discuss at least 5 techniques.",
    "Explain the differences between SQL and NoSQL databases and when to use each.",
    "Design a real-time chat application using WebSockets. What challenges would you face?",
  ],
};

export function generateQuestions(): Question[] {
  const questions: Question[] = [];
  const difficulties: Array<{ type: 'easy' | 'medium' | 'hard', timeLimit: number }> = [
    { type: 'easy', timeLimit: 20 },
    { type: 'easy', timeLimit: 20 },
    { type: 'medium', timeLimit: 60 },
    { type: 'medium', timeLimit: 60 },
    { type: 'hard', timeLimit: 120 },
    { type: 'hard', timeLimit: 120 },
  ];

  difficulties.forEach(({ type, timeLimit }) => {
    const questionPool = questionBank[type];
    const randomIndex = Math.floor(Math.random() * questionPool.length);
    
    questions.push({
      id: uuidv4(),
      question: questionPool[randomIndex],
      difficulty: type,
      timeLimit,
    });
  });

  return questions;
}

export function scoreAnswer(question: Question, answer: string, timeSpent: number): number {
  // Mock AI scoring logic
  const answerLength = answer.trim().length;
  const timeEfficiency = Math.max(0, 1 - (timeSpent / question.timeLimit));
  
  let baseScore = 0;
  
  // Length-based scoring
  if (answerLength > 200) baseScore = 8;
  else if (answerLength > 100) baseScore = 6;
  else if (answerLength > 50) baseScore = 4;
  else if (answerLength > 20) baseScore = 2;
  else baseScore = 1;
  
  // Difficulty multiplier
  const difficultyMultiplier = {
    easy: 1,
    medium: 1.2,
    hard: 1.5,
  }[question.difficulty];
  
  // Time bonus (max 2 points)
  const timeBonus = timeEfficiency * 2;
  
  // Keyword bonus (simple check for technical terms)
  const keywords = ['react', 'javascript', 'node', 'api', 'database', 'component', 'function', 'async', 'promise'];
  const keywordCount = keywords.reduce((count, keyword) => 
    count + (answer.toLowerCase().includes(keyword) ? 1 : 0), 0
  );
  const keywordBonus = Math.min(keywordCount * 0.5, 2);
  
  const finalScore = Math.min(10, (baseScore * difficultyMultiplier + timeBonus + keywordBonus));
  return Math.round(finalScore * 10) / 10; // Round to 1 decimal place
}

export function generateSummary(questions: Question[]): { score: number; summary: string } {
  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
  const averageScore = totalScore / questions.length;
  
  const easyQuestions = questions.filter(q => q.difficulty === 'easy');
  const mediumQuestions = questions.filter(q => q.difficulty === 'medium');
  const hardQuestions = questions.filter(q => q.difficulty === 'hard');
  
  const easyAvg = easyQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / easyQuestions.length;
  const mediumAvg = mediumQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / mediumQuestions.length;
  const hardAvg = hardQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / hardQuestions.length;
  
  let performanceLevel = '';
  let recommendation = '';
  
  if (averageScore >= 8) {
    performanceLevel = 'Excellent';
    recommendation = 'Strong candidate with comprehensive technical knowledge. Highly recommended for senior positions.';
  } else if (averageScore >= 6) {
    performanceLevel = 'Good';
    recommendation = 'Solid technical foundation with room for growth. Suitable for mid-level positions.';
  } else if (averageScore >= 4) {
    performanceLevel = 'Fair';
    recommendation = 'Basic understanding demonstrated. May be suitable for junior positions with mentoring.';
  } else {
    performanceLevel = 'Needs Improvement';
    recommendation = 'Limited technical knowledge shown. Additional training and experience recommended.';
  }
  
  const summary = `
Overall Performance: ${performanceLevel} (${averageScore.toFixed(1)}/10)

Breakdown:
• Easy Questions: ${easyAvg.toFixed(1)}/10
• Medium Questions: ${mediumAvg.toFixed(1)}/10
• Hard Questions: ${hardAvg.toFixed(1)}/10

${recommendation}

The candidate showed ${easyAvg > 6 ? 'strong' : easyAvg > 4 ? 'adequate' : 'weak'} foundational knowledge, ${mediumAvg > 6 ? 'good' : mediumAvg > 4 ? 'fair' : 'limited'} intermediate skills, and ${hardAvg > 6 ? 'impressive' : hardAvg > 4 ? 'developing' : 'minimal'} advanced problem-solving abilities.
  `.trim();
  
  return { score: Math.round(averageScore * 10) / 10, summary };
}