import { useState, useEffect, useCallback } from 'react';
import type { ProgressData } from '../types';

const PROGRESS_KEY = 'adai-progress';

const getDefaultProgress = (): ProgressData => ({
  totalPracticeTime: 0,
  listeningAccuracy: { correct: 0, total: 0 },
  essaysWritten: 0,
  speakingSessions: 0,
  practicedTenses: [],
  practicedGrammarTopics: [],
  grammarChecks: 0,
  visitedTools: [],
  pronunciationSessions: 0,
  contentAnalyzed: 0,
});

export const useProgress = () => {
  const [progressData, setProgressData] = useState<ProgressData>(() => {
    try {
      const savedData = localStorage.getItem(PROGRESS_KEY);
      const parsedData = savedData ? JSON.parse(savedData) : getDefaultProgress();
      // Ensure data structure is valid after parsing
      return { ...getDefaultProgress(), ...parsedData };
    } catch (error) {
      console.error('Error reading progress from localStorage', error);
      return getDefaultProgress();
    }
  });

  useEffect(() => {
    try {
      const serializedData = JSON.stringify(progressData);
      localStorage.setItem(PROGRESS_KEY, serializedData);
    } catch (error) {
      console.error('Error saving progress to localStorage', error);
    }
  }, [progressData]);

  const addPracticeTime = useCallback((seconds: number) => {
    if (seconds > 0) {
      setProgressData(prev => ({ ...prev, totalPracticeTime: (prev.totalPracticeTime || 0) + seconds }));
    }
  }, []);

  const logListeningResult = useCallback((correctAnswers: number, totalQuestions: number) => {
    setProgressData(prev => ({
      ...prev,
      listeningAccuracy: {
        correct: (prev.listeningAccuracy?.correct || 0) + correctAnswers,
        total: (prev.listeningAccuracy?.total || 0) + totalQuestions,
      }
    }));
  }, []);

  const logEssayWritten = useCallback(() => {
    setProgressData(prev => ({ ...prev, essaysWritten: (prev.essaysWritten || 0) + 1 }));
  }, []);

  const logSpeakingSession = useCallback(() => {
    setProgressData(prev => ({ ...prev, speakingSessions: (prev.speakingSessions || 0) + 1 }));
  }, []);

  const logTensePracticed = useCallback((tenseName: string) => {
    setProgressData(prev => {
      const practiced = prev.practicedTenses || [];
      if (practiced.includes(tenseName)) return prev;
      return { ...prev, practicedTenses: [...practiced, tenseName] };
    });
  }, []);

  const logGrammarTopicPracticed = useCallback((topicName: string) => {
    setProgressData(prev => {
      const practiced = prev.practicedGrammarTopics || [];
      if (practiced.includes(topicName)) return prev;
      return { ...prev, practicedGrammarTopics: [...practiced, topicName] };
    });
  }, []);
  
  const logGrammarCheck = useCallback(() => {
    setProgressData(prev => ({ ...prev, grammarChecks: (prev.grammarChecks || 0) + 1 }));
  }, []);

  const logToolVisit = useCallback((toolId: string) => {
    setProgressData(prev => {
        const visited = prev.visitedTools || [];
        if (visited.includes(toolId)) return prev;
        return { ...prev, visitedTools: [...visited, toolId]};
    });
  }, []);

  const logPronunciationSession = useCallback(() => {
    setProgressData(prev => ({ ...prev, pronunciationSessions: (prev.pronunciationSessions || 0) + 1 }));
  }, []);

  const logContentAnalyzed = useCallback(() => {
    setProgressData(prev => ({ ...prev, contentAnalyzed: (prev.contentAnalyzed || 0) + 1 }));
  }, []);

  return {
    progressData,
    addPracticeTime,
    logListeningResult,
    logEssayWritten,
    logSpeakingSession,
    logTensePracticed,
    logGrammarTopicPracticed,
    logGrammarCheck,
    logToolVisit,
    logPronunciationSession,
    logContentAnalyzed,
  };
};