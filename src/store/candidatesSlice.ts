import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number;
  answer?: string;
  score?: number;
  timeSpent?: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeText: string;
  questions: Question[];
  finalScore: number;
  summary: string;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

interface CandidatesState {
  candidates: Candidate[];
  selectedCandidateId?: string;
}

const initialState: CandidatesState = {
  candidates: [],
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (state, action: PayloadAction<{ id: string; updates: Partial<Candidate> }>) => {
      const index = state.candidates.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.candidates[index] = { ...state.candidates[index], ...action.payload.updates };
      }
    },
    setSelectedCandidate: (state, action: PayloadAction<string>) => {
      state.selectedCandidateId = action.payload;
    },
  },
});

export const { addCandidate, updateCandidate, setSelectedCandidate } = candidatesSlice.actions;
export default candidatesSlice.reducer;