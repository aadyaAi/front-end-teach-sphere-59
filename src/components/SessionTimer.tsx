
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Timer, Play, Pause, Reset } from "lucide-react";
import { peerService } from '@/services/peerService';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface SessionTimerProps {
  roomId: string;
}

type TimerMode = 'countdown' | 'countup';

const SessionTimer: React.FC<SessionTimerProps> = ({ roomId }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0); // time in seconds
  const [mode, setMode] = useState<TimerMode>('countup');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pausedTime, setPausedTime] = useState<number>(0);
  const location = useLocation();

  // Format seconds into MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.abs(seconds) % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isRunning) {
      interval = setInterval(() => {
        if (startTime) {
          const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000) + pausedTime;
          setTime(mode === 'countup' ? elapsedSeconds : -elapsedSeconds);
        }
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, startTime, pausedTime, mode]);

  // Handle timer actions from other peers
  useEffect(() => {
    const handleTimerAction = (action: any) => {
      if (action.type === 'timer-start') {
        setIsRunning(true);
        setStartTime(action.startTime);
        setPausedTime(action.pausedTime || 0);
        setMode(action.mode || 'countup');
        toast.info('Timer started by collaborator');
      } else if (action.type === 'timer-pause') {
        setIsRunning(false);
        setPausedTime(action.pausedTime || 0);
        toast.info('Timer paused by collaborator');
      } else if (action.type === 'timer-reset') {
        setIsRunning(false);
        setStartTime(null);
        setPausedTime(0);
        setTime(0);
        toast.info('Timer reset by collaborator');
      }
    };

    // Register with peerService
    peerService.registerTimerActionHandler(handleTimerAction);
    
    return () => {
      peerService.unregisterTimerActionHandler();
    };
  }, [roomId]);

  // Start timer and sync with peers
  const handleStart = useCallback(() => {
    const now = Date.now();
    setIsRunning(true);
    setStartTime(now);
    
    // Sync with peers
    peerService.sendTimerAction({
      type: 'timer-start',
      startTime: now,
      pausedTime: pausedTime,
      mode: mode
    });
    
    toast.success('Timer started');
  }, [pausedTime, mode]);

  // Pause timer and sync with peers
  const handlePause = useCallback(() => {
    setIsRunning(false);
    if (startTime) {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000) + pausedTime;
      setPausedTime(elapsedSeconds);
    }
    
    // Sync with peers
    peerService.sendTimerAction({
      type: 'timer-pause',
      pausedTime: pausedTime + (startTime ? Math.floor((Date.now() - startTime) / 1000) : 0)
    });
    
    toast.info('Timer paused');
  }, [startTime, pausedTime]);

  // Reset timer and sync with peers
  const handleReset = useCallback(() => {
    setIsRunning(false);
    setStartTime(null);
    setPausedTime(0);
    setTime(0);
    
    // Sync with peers
    peerService.sendTimerAction({
      type: 'timer-reset'
    });
    
    toast.info('Timer reset');
  }, []);

  // Toggle timer mode
  const toggleMode = useCallback(() => {
    setMode(prev => {
      const newMode = prev === 'countup' ? 'countdown' : 'countup';
      toast.info(`Timer mode set to ${newMode}`);
      return newMode;
    });
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="bg-gray-100 border-gray-300 hover:bg-gray-200 p-1 h-8 min-w-[80px]"
        onClick={toggleMode}
      >
        <Timer className="w-4 h-4 mr-1" />
        <span className={mode === 'countdown' && time < 0 ? "text-red-500" : ""}>
          {formatTime(time)}
        </span>
      </Button>
      
      <div className="flex gap-1">
        {!isRunning ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleStart}
            className="p-1 h-8 w-8 flex items-center justify-center"
          >
            <Play className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handlePause}
            className="p-1 h-8 w-8 flex items-center justify-center"
          >
            <Pause className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="p-1 h-8 w-8 flex items-center justify-center"
        >
          <Reset className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SessionTimer;
