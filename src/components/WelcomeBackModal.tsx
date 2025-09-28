import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setWelcomeBack } from '../store/interviewSlice';
import { X, Clock, User } from 'lucide-react';

const WelcomeBackModal: React.FC = () => {
  const dispatch = useDispatch();
  const { showWelcomeBack, currentCandidateId } = useSelector((state: RootState) => state.interview);
  const candidate = useSelector((state: RootState) => 
    state.candidates.candidates.find(c => c.id === currentCandidateId)
  );

  if (!showWelcomeBack || !candidate) return null;

  const handleContinue = () => {
    dispatch(setWelcomeBack(false));
  };

  const handleStartOver = () => {
    // Reset candidate status and restart
    dispatch(setWelcomeBack(false));
    // Additional logic to reset interview would go here
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Welcome Back!</h2>
          <button
            onClick={() => dispatch(setWelcomeBack(false))}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-2 rounded-full">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{candidate.name}</p>
              <p className="text-sm text-gray-600">{candidate.email}</p>
            </div>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Interview in Progress</span>
            </div>
            <p className="text-sm text-amber-700">
              You have an unfinished interview session. Would you like to continue where you left off?
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleContinue}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Continue Interview
            </button>
            <button
              onClick={handleStartOver}
              className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBackModal;