import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  totalTime: number;
  isActive: boolean;
  onTimeUp: () => void;
  onTimeUpdate?: (timeRemaining: number) => void;
}

const Timer: React.FC<TimerProps> = ({ totalTime, isActive, onTimeUp, onTimeUpdate }) => {
  const [timeRemaining, setTimeRemaining] = useState(totalTime);

  useEffect(() => {
    setTimeRemaining(totalTime);
  }, [totalTime]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        onTimeUpdate?.(newTime);
        
        if (newTime <= 0) {
          onTimeUp();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp, onTimeUpdate]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const percentage = (timeRemaining / totalTime) * 100;
  
  const isLowTime = percentage <= 25;
  const isCritical = percentage <= 10;

  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm ${isCritical ? 'border-red-500' : isLowTime ? 'border-amber-500' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isCritical ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <Clock className={`h-5 w-5 ${isLowTime ? 'text-amber-500' : 'text-blue-500'}`} />
          )}
          <span className="font-medium text-gray-700">Time Remaining</span>
        </div>
        <span className={`text-lg font-mono font-bold ${isCritical ? 'text-red-600' : isLowTime ? 'text-amber-600' : 'text-blue-600'}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${
            isCritical 
              ? 'bg-red-500' 
              : isLowTime 
                ? 'bg-amber-500' 
                : 'bg-blue-500'
          }`}
          style={{ width: `${Math.max(0, percentage)}%` }}
        />
      </div>
      
      {isLowTime && (
        <p className={`text-xs mt-2 font-medium ${isCritical ? 'text-red-600' : 'text-amber-600'}`}>
          {isCritical ? '⚠️ Time almost up!' : '⏰ Running low on time'}
        </p>
      )}
    </div>
  );
};

export default Timer;