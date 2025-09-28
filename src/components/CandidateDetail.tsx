import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { User, Mail, Phone, Clock, CheckCircle, AlertCircle, FileText, TrendingUp, Award } from 'lucide-react';

const CandidateDetail: React.FC = () => {
  const { selectedCandidateId } = useSelector((state: RootState) => state.candidates);
  const candidate = useSelector((state: RootState) =>
    state.candidates.candidates.find(c => c.id === selectedCandidateId)
  );

  if (!candidate) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No candidate selected</h3>
          <p className="text-gray-400">Select a candidate from the list to view details</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50';
    if (score >= 6) return 'text-blue-600 bg-blue-50';
    if (score >= 4) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const completedQuestions = candidate.questions.filter(q => q.answer);
  const averageScore = completedQuestions.length > 0 
    ? completedQuestions.reduce((sum, q) => sum + (q.score || 0), 0) / completedQuestions.length 
    : 0;

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{candidate.name}</h2>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{candidate.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{candidate.phone}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {candidate.status === 'completed' ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : candidate.status === 'in-progress' ? (
                <Clock className="h-5 w-5 text-blue-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm font-medium capitalize">
                {candidate.status.replace('-', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Score Overview */}
        {candidate.status === 'completed' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-blue-600" />
              Performance Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${getScoreColor(candidate.finalScore)}`}>
                <div className="text-2xl font-bold">{candidate.finalScore}/10</div>
                <div className="text-sm opacity-80">Final Score</div>
              </div>
              <div className="p-4 rounded-lg bg-blue-50 text-blue-600">
                <div className="text-2xl font-bold">{completedQuestions.length}/6</div>
                <div className="text-sm opacity-80">Completed</div>
              </div>
              <div className="p-4 rounded-lg bg-purple-50 text-purple-600">
                <div className="text-2xl font-bold">{averageScore.toFixed(1)}/10</div>
                <div className="text-sm opacity-80">Average Score</div>
              </div>
            </div>
          </div>
        )}

        {/* AI Summary */}
        {candidate.summary && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              AI Assessment Summary
            </h3>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 font-sans leading-relaxed">
                {candidate.summary}
              </pre>
            </div>
          </div>
        )}

        {/* Questions & Answers */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Interview Questions & Answers
          </h3>
          <div className="space-y-6">
            {candidate.questions.map((question, index) => (
              <div key={question.id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {question.timeLimit}s limit
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium mb-3">{question.question}</p>
                  </div>
                  {question.score !== undefined && (
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(question.score)}`}>
                      {question.score}/10
                    </div>
                  )}
                </div>
                
                {question.answer ? (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Answer:</span>
                      {question.timeSpent !== undefined && (
                        <span className="text-xs text-gray-500">
                          Answered in {question.timeSpent}s
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 leading-relaxed">{question.answer}</p>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-gray-500 text-center italic">Not answered yet</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resume Text */}
        <div className="bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Resume Content
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
              {candidate.resumeText}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetail;