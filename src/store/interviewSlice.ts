import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InterviewState {
  currentCandidateId?: string;
  currentQuestionIndex: number;
  isInterviewActive: boolean;
  timerStarted: boolean;
  timeRemaining: number;
  showWelcomeBack: boolean;
  missingFields: string[];
  isCollectingInfo: boolean;
}

const initialState: InterviewState = {
  currentQuestionIndex: 0,
  isInterviewActive: false,
  timerStarted: false,
  timeRemaining: 0,
  showWelcomeBack: false,
  missingFields: [],
  isCollectingInfo: false,
};

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    setCurrentCandidate: (state, action: PayloadAction<string>) => {
      state.currentCandidateId = action.payload;
    },
    startInterview: (state) => {
      state.isInterviewActive = true;
      state.currentQuestionIndex = 0;
      state.isCollectingInfo = false;
    },
    nextQuestion: (state) => {
      state.currentQuestionIndex += 1;
      state.timerStarted = false;
    },
    startTimer: (state, action: PayloadAction<number>) => {
      state.timerStarted = true;
      state.timeRemaining = action.payload;
    },
    updateTimer: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    completeInterview: (state) => {
      state.isInterviewActive = false;
      state.currentQuestionIndex = 0;
      state.currentCandidateId = undefined;
      state.timerStarted = false;
    },
    setWelcomeBack: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeBack = action.payload;
    },
    setMissingFields: (state, action: PayloadAction<string[]>) => {
      state.missingFields = action.payload;
    },
    setCollectingInfo: (state, action: PayloadAction<boolean>) => {
      state.isCollectingInfo = action.payload;
    },
    resetInterview: (state) => {
      return initialState;
    },
  },
});

export const {
  setCurrentCandidate,
  startInterview,
  nextQuestion,
  startTimer,
  updateTimer,
  completeInterview,
  setWelcomeBack,
  setMissingFields,
  setCollectingInfo,
  resetInterview,
} = interviewSlice.actions;
export default interviewSlice.reducer;