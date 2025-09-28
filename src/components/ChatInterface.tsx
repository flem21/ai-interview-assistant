import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { Send, Bot, User } from 'lucide-react';
import Timer from './Timer';
import { nextQuestion, startTimer, updateTimer } from '../store/interviewSlice';
import { updateCandidate } from '../store/candidatesSlice';
import { scoreAnswer } from '../utils/aiMock';

interface Message {
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isWaitingForAnswer: boolean;
  currentQuestion?: any;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isWaitingForAnswer,
  currentQuestion
}) => {
  const [inputValue, setInputValue] = useState('');
  const [startTime, setStartTime] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  
  const { 
    timerStarted, 
    timeRemaining, 
    currentCandidateId, 
    currentQuestionIndex 
  } = useSelector((state: RootState) => state.interview);
  
  const candidate = useSelector((state: RootState) =>
    state.candidates.candidates.find(c => c.id === currentCandidateId)
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isWaitingForAnswer && currentQuestion && !timerStarted) {
      dispatch(startTimer(currentQuestion.timeLimit));
      setStartTime(new Date());
    }
  }, [isWaitingForAnswer, currentQuestion, timerStarted, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && isWaitingForAnswer) {
      handleAnswer(inputValue.trim());
      setInputValue('');
    }
  };

  const handleAnswer = (answer: string) => {
    if (!candidate || !currentQuestion || !startTime) return;

    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    const score = scoreAnswer(currentQuestion, answer, timeSpent);

    // Update the candidate's question with the answer and score
    const updatedQuestions = [...candidate.questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      answer,
      score,
      timeSpent,
    };

    dispatch(updateCandidate({
      id: candidate.id,
      updates: { questions: updatedQuestions }
    }));

    onSendMessage(answer);
    setStartTime(null);
  };

  const handleTimeUp = () => {
    if (isWaitingForAnswer && inputValue.trim()) {
      handleAnswer(inputValue.trim());
      setInputValue('');
    } else if (isWaitingForAnswer) {
      handleAnswer('No answer provided (time expired)');
    }
  };

  const handleTimeUpdate = (time: number) => {
    dispatch(updateTimer(time));
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-2xl ${
              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className={`px-4 py-3 rounded-lg shadow-sm ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-white text-gray-800 border rounded-bl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Timer */}
      {isWaitingForAnswer && currentQuestion && timerStarted && (
        <div className="p-4 border-t bg-white">
          <Timer
            totalTime={currentQuestion.timeLimit}
            isActive={true}
            onTimeUp={handleTimeUp}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={isWaitingForAnswer ? "Type your answer..." : "Chat is disabled during processing..."}
            disabled={!isWaitingForAnswer}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !isWaitingForAnswer}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
        
        {isWaitingForAnswer && (
          <p className="text-xs text-gray-500 mt-2">
            💡 Take your time to provide a thoughtful answer. Quality matters more than speed!
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;