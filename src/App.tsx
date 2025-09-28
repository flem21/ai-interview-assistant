import React, { useEffect, useState } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store/store';
import { RootState } from './store/store';
import IntervieweeTab from './components/IntervieweeTab';
import InterviewerTab from './components/InterviewerTab';
import WelcomeBackModal from './components/WelcomeBackModal';
import { setWelcomeBack } from './store/interviewSlice';
import { Users, MessageCircle, Brain, Loader } from 'lucide-react';

type TabType = 'interviewee' | 'interviewer';

const AppContent: React.FC = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<TabType>('interviewee');
  
  const { currentCandidateId, isInterviewActive } = useSelector((state: RootState) => state.interview);
  const candidates = useSelector((state: RootState) => state.candidates.candidates);

  useEffect(() => {
    // Check if there's an incomplete interview on app load
    if (currentCandidateId && isInterviewActive) {
      const candidate = candidates.find(c => c.id === currentCandidateId);
      if (candidate && candidate.status === 'in-progress') {
        dispatch(setWelcomeBack(true));
      }
    }
  }, [currentCandidateId, isInterviewActive, candidates, dispatch]);

  const completedCandidates = candidates.filter(c => c.status === 'completed').length;
  const inProgressCandidates = candidates.filter(c => c.status === 'in-progress').length;

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">AI Interview Assistant</h1>
                <p className="text-sm text-gray-600">Intelligent technical screening platform</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">{completedCandidates} Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">{inProgressCandidates} In Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-t">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('interviewee')}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'interviewee'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <MessageCircle className="h-4 w-4" />
              <span>Interviewee</span>
            </button>
            <button
              onClick={() => setActiveTab('interviewer')}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'interviewer'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Interviewer Dashboard</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {activeTab === 'interviewee' ? <IntervieweeTab /> : <InterviewerTab />}
      </main>

      {/* Welcome Back Modal */}
      <WelcomeBackModal />
    </div>
  );
};

const LoadingSpinner: React.FC = () => (
  <div className="h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center">
      <Loader className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-gray-600">Loading Interview Assistant...</p>
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

export default App;