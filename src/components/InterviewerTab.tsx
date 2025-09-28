import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import CandidateList from './CandidateList';
import CandidateDetail from './CandidateDetail';

const InterviewerTab: React.FC = () => {
  const { selectedCandidateId } = useSelector((state: RootState) => state.candidates);

  return (
    <div className="h-full flex">
      {/* Left Panel - Candidate List */}
      <div className="w-1/2 border-r">
        <CandidateList />
      </div>
      
      {/* Right Panel - Candidate Details */}
      <div className="w-1/2">
        <CandidateDetail />
      </div>
    </div>
  );
};

export default InterviewerTab;