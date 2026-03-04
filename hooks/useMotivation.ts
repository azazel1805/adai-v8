import { useState, useEffect, useCallback } from 'react';
import type { MotivationData, LearningPlan } from '../types';

const MOTIVATION_KEY = 'adai-motivation';

const getDefaultMotivation = (): MotivationData => ({
    lastLoginDate: '',
    currentStreak: 0,
    unlockedAchievements: [],
    userLevel: null,
    userGoal: null,
    weeklyPlan: null,
});

export const useMotivation = () => {
  const [motivationData, setMotivationData] = useState<MotivationData>(() => {
    try {
      const savedData = localStorage.getItem(MOTIVATION_KEY);
      const parsed = savedData ? JSON.parse(savedData) : getDefaultMotivation();
      return { ...getDefaultMotivation(), ...parsed }; // Merge with default to handle new fields
    } catch (error) {
      console.error('Error reading motivation data from localStorage', error);
      return getDefaultMotivation();
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(MOTIVATION_KEY, JSON.stringify(motivationData));
    } catch (error) {
      console.error('Error saving motivation data to localStorage', error);
    }
  }, [motivationData]);

  const checkStreak = useCallback(() => {
    setMotivationData(prev => {
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD

        if (prev.lastLoginDate === todayStr) {
            return prev; // Already logged in today
        }

        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (prev.lastLoginDate === yesterdayStr) {
            // Continue streak
            return { ...prev, lastLoginDate: todayStr, currentStreak: prev.currentStreak + 1 };
        } else {
            // Reset streak
            return { ...prev, lastLoginDate: todayStr, currentStreak: 1 };
        }
    });
  }, []);
  
  const unlockAchievement = useCallback((achievementId: string) => {
    setMotivationData(prev => {
        if (prev.unlockedAchievements.includes(achievementId)) {
            return prev;
        }
        return { ...prev, unlockedAchievements: [...prev.unlockedAchievements, achievementId] };
    });
  }, []);

  const savePreferences = useCallback((level: string, goal: string) => {
    setMotivationData(prev => ({ ...prev, userLevel: level, userGoal: goal, weeklyPlan: null })); // Reset plan when prefs change
  }, []);

  const saveWeeklyPlan = useCallback((plan: LearningPlan) => {
    setMotivationData(prev => ({ ...prev, weeklyPlan: plan }));
  }, []);
  
  const toggleTaskCompletion = useCallback((taskIndex: number) => {
    setMotivationData(prev => {
        if (!prev.weeklyPlan) return prev;
        const newTasks = [...prev.weeklyPlan.tasks];
        newTasks[taskIndex].completed = !newTasks[taskIndex].completed;
        return { ...prev, weeklyPlan: { ...prev.weeklyPlan, tasks: newTasks }};
    });
  }, []);

  return {
    motivationData,
    checkStreak,
    unlockAchievement,
    savePreferences,
    saveWeeklyPlan,
    toggleTaskCompletion,
  };
};
