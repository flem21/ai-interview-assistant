import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setSelectedCandidate } from '../store/candidatesSlice';
import { Search, User, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

const CandidateList: React.FC = () => {
  const dispatch = useDispatch();
  const { candidates, selectedCandidateId } = useSelector((state: RootState) => state.candidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'name'>('score');

  const filteredAndSortedCandidates = candidates
    .filter(candidate => 
      candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.finalScore - a.finalScore;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 4) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Candidate Dashboard</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <TrendingUp className="h-4 w-4" />
            <span>{candidates.length} Total Candidates</span>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'score' | 'date' | 'name')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="score">Sort by Score</option>
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Candidates List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredAndSortedCandidates.length === 0 ? (
          <div className="text-center py-12">
            <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">
              {searchTerm ? 'No candidates found' : 'No candidates yet'}
            </h3>
            <p className="text-gray-400">
              {searchTerm ? 'Try adjusting your search criteria' : 'Candidates will appear here once they start interviews'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredAndSortedCandidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => dispatch(setSelectedCandidate(candidate.id))}
                className={`bg-white border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedCandidateId === candidate.id 
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="bg-gray-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{candidate.name}</h3>
                      <p className="text-sm text-gray-600 truncate">{candidate.email}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(candidate.status)}
                          <span className="text-xs text-gray-500 capitalize">{candidate.status.replace('-', ' ')}</span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(candidate.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    {candidate.status === 'completed' && (
                      <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getScoreColor(candidate.finalScore)}`}>
                        {candidate.finalScore}/10
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-600">
                        {candidate.questions.filter(q => q.answer).length}/{candidate.questions.length}
                      </div>
                      <div className="text-xs text-gray-500">Questions</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateList;