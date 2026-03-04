import { useState, useEffect, useCallback } from 'react';

const QUICK_ACTIONS_KEY = 'adai-quick-actions';
const DEFAULT_QUICK_ACTIONS = ['ai-tutor', 'dictionary', 'speaking-simulator', 'essay-helper'];

export const useQuickActions = () => {
  const [quickActionIds, setQuickActionIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(QUICK_ACTIONS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_QUICK_ACTIONS;
    } catch (error) {
      console.error('Error reading quick actions from localStorage', error);
      return DEFAULT_QUICK_ACTIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(QUICK_ACTIONS_KEY, JSON.stringify(quickActionIds));
    } catch (error) {
      console.error('Error saving quick actions to localStorage', error);
    }
  }, [quickActionIds]);

  const saveQuickActions = useCallback((newActions: string[]) => {
    setQuickActionIds(newActions);
  }, []);

  return { quickActionIds, saveQuickActions };
};
