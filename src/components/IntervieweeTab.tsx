import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import ResumeUpload from './ResumeUpload';
import ChatInterface from './ChatInterface';
import { addCandidate, updateCandidate, Candidate } from '../store/candidatesSlice';
import { 
  setCurrentCandidate, 
  startInterview, 
  nextQuestion, 
  completeInterview, 
  setMissingFields, 
  setCollectingInfo 
} from '../store/interviewSlice';
import { generateQuestions, generateSummary } from '../utils/aiMock';
import { v4 as uuidv4 } from 'uuid';
import { User, Mail, Phone, CheckCircle, Cross as Progress } from 'lucide-react';

interface Message {
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

const IntervieweeTab: React.FC = () => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState<Message[]>([]);
  const [resumeData, setResumeData] = useState<any>(null);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

  const { 
    currentCandidateId, 
    currentQuestionIndex, 
    isInterviewActive, 
    missingFields, 
    isCollectingInfo 
  } = useSelector((state: RootState) => state.interview);

  const candidate = useSelector((state: RootState) =>
    state.candidates.candidates.find(c => c.id === currentCandidateId)
  );

  useEffect(() => {
    // Welcome message
    if (messages.length === 0) {
      addBotMessage("👋 Welcome to the AI Interview Assistant! Please upload your resume to get started.");
    }
  }, []);

  const addBotMessage = (content: string) => {
    setMessages(prev => [...prev, {
      type: 'bot',
      content,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      type: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const handleResumeUploaded = (data: any) => {
    setResumeData(data);
    
    // Check for missing fields
    const missing = [];
    if (!data.name) missing.push('name');
    if (!data.email) missing.push('email');
    if (!data.phone) missing.push('phone');

    if (missing.length > 0) {
      dispatch(setMissingFields(missing));
      dispatch(setCollectingInfo(true));
      addBotMessage(`Great! I've processed your resume. I need to collect some missing information:\n\n${
        missing.map(field => `• ${field.charAt(0).toUpperCase() + field.slice(1)}`).join('\n')
      }\n\nLet's start with your ${missing[0]}:`);
      setIsWaitingForAnswer(true);
    } else {
      createCandidateAndStartInterview(data);
    }
  };

  const createCandidateAndStartInterview = (data: any) => {
    const candidateId = uuidv4();
    const questions = generateQuestions();
    
    const newCandidate: Candidate = {
      id: candidateId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      resumeText: data.text,
      questions,
      finalScore: 0,
      summary: '',
      status: 'in-progress',
      createdAt: new Date().toISOString(),
    };

    dispatch(addCandidate(newCandidate));
    dispatch(setCurrentCandidate(candidateId));
    dispatch(startInterview());

    addBotMessage(`Perfect! Hello ${data.name}! 🎯 
    
Ready to start your technical interview? Here's what to expect:

📋 **Interview Structure:**
• 6 questions total (2 Easy → 2 Medium → 2 Hard)
• Each question is timed
• Easy: 20 seconds, Medium: 60 seconds, Hard: 2 minutes

⏰ **Timer Rules:**
• Timer starts when the question appears
• If time runs out, your current answer is automatically submitted
• Quality over speed - take your time to think!

🎯 **Scoring:**
• Each question is scored out of 10 points
• Based on technical accuracy, completeness, and clarity

Ready to begin? Let's start with your first question!`);

    setTimeout(() => {
      askNextQuestion(questions, 0);
    }, 2000);
  };

  const askNextQuestion = (questions: any[], index: number) => {
    if (index >= questions.length) {
      completeInterviewFlow();
      return;
    }

    const question = questions[index];
    const difficulty = question.difficulty.toUpperCase();
    const difficultyColor = {
      EASY: '🟢',
      MEDIUM: '🟡', 
      HARD: '🔴'
    }[difficulty] || '🔵';

    addBotMessage(`${difficultyColor} **Question ${index + 1}/6 - ${difficulty}**
    
${question.question}

⏱️ You have ${question.timeLimit} seconds to answer. Timer will start now!`);
    
    setIsWaitingForAnswer(true);
  };

  const completeInterviewFlow = () => {
    if (!candidate) return;

    const { score, summary } = generateSummary(candidate.questions);
    
    dispatch(updateCandidate({
      id: candidate.id,
      updates: {
        finalScore: score,
        summary,
        status: 'completed',
        completedAt: new Date().toISOString()
      }
    }));

    dispatch(completeInterview());
    setIsWaitingForAnswer(false);

    addBotMessage(`🎉 **Interview Complete!**

**Final Score: ${score}/10**

**Performance Summary:**
${summary}

Thank you for completing the interview! Your responses have been recorded and will be reviewed by our team.

You can now switch to the Interviewer tab to see your results in detail.`);
  };

  const handleSendMessage = (message: string) => {
    addUserMessage(message);
    setIsWaitingForAnswer(false);

    if (isCollectingInfo) {
      handleMissingFieldResponse(message);
    } else if (isInterviewActive && candidate) {
      // Move to next question after a brief delay
      setTimeout(() => {
        dispatch(nextQuestion());
        if (currentQuestionIndex + 1 < candidate.questions.length) {
          askNextQuestion(candidate.questions, currentQuestionIndex + 1);
        } else {
          completeInterviewFlow();
        }
      }, 1000);
    }
  };

  const handleMissingFieldResponse = (response: string) => {
    const currentMissingIndex = missingFields.findIndex(field => 
      !resumeData[field] || resumeData[field] === ''
    );
    
    if (currentMissingIndex === -1) return;

    const currentField = missingFields[currentMissingIndex];
    const updatedData = { ...resumeData, [currentField]: response };
    setResumeData(updatedData);

    const remainingFields = missingFields.filter((field, index) => 
      index > currentMissingIndex && (!updatedData[field] || updatedData[field] === '')
    );

    if (remainingFields.length > 0) {
      addBotMessage(`Great! Now I need your ${remainingFields[0]}:`);
      setIsWaitingForAnswer(true);
    } else {
      dispatch(setCollectingInfo(false));
      addBotMessage("Perfect! I have all the information needed. Let's proceed with your interview.");
      setTimeout(() => {
        createCandidateAndStartInterview(updatedData);
      }, 1000);
    }
  };

  const renderProgressBar = () => {
    if (!candidate || !isInterviewActive) return null;

    const progress = ((currentQuestionIndex + 1) / candidate.questions.length) * 100;
    
    return (
      <div className="bg-white border-b p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Interview Progress</span>
          <span className="text-sm text-gray-500">
            {currentQuestionIndex + 1} of {candidate.questions.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  };

  const renderCandidateInfo = () => {
    if (!resumeData || isCollectingInfo) return null;

    return (
      <div className="bg-white border-b p-4">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">{resumeData.name}</h3>
            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{resumeData.email}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{resumeData.phone}</span>
              </div>
              {candidate?.status === 'completed' && (
                <div className="flex items-center space-x-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!resumeData) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">AI Technical Interview</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Upload your resume to start your personalized technical interview. 
              Our AI will assess your skills through targeted questions.
            </p>
          </div>
          <ResumeUpload onResumeUploaded={handleResumeUploaded} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {renderCandidateInfo()}
      {renderProgressBar()}
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isWaitingForAnswer={isWaitingForAnswer}
        currentQuestion={candidate?.questions[currentQuestionIndex]}
      />
    </div>
  );
};

export default IntervieweeTab;