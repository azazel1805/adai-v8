import { useState, useEffect, useCallback } from 'react';
import type { NotebookData, SavedWord, SavedEssay, TenseExplanation, AcademicGrammarExplanation, SavedTranslation, SavedRephrasing } from '../types';

const NOTEBOOK_KEY = 'adai-notebook';

const getDefaultNotebook = (): NotebookData => ({
  notes: '',
  vocabulary: [],
  tenses: [],
  academicGrammar: [],
  essays: [],
  translations: [],
  rephrasings: [],
});

export const useNotebook = () => {
  const [notebookData, setNotebookData] = useState<NotebookData>(() => {
    try {
      const savedData = localStorage.getItem(NOTEBOOK_KEY);
      return savedData ? JSON.parse(savedData) : getDefaultNotebook();
    } catch (error) {
      console.error('Error reading notebook from localStorage', error);
      return getDefaultNotebook();
    }
  });

  useEffect(() => {
    try {
      const serializedData = JSON.stringify(notebookData);
      localStorage.setItem(NOTEBOOK_KEY, serializedData);
    } catch (error) {
      console.error('Error saving notebook to localStorage', error);
    }
  }, [notebookData]);
  
  const updateNotes = useCallback((notes: string) => {
    setNotebookData(prev => ({ ...prev, notes }));
  }, []);

  const addWord = useCallback((word: SavedWord) => {
    setNotebookData(prev => {
        if (prev.vocabulary.some(w => w.id === word.id)) return prev; // Avoid duplicates
        return { ...prev, vocabulary: [...prev.vocabulary, word] };
    });
  }, []);

  const removeWord = useCallback((wordId: string) => {
    setNotebookData(prev => ({ ...prev, vocabulary: prev.vocabulary.filter(w => w.id !== wordId) }));
  }, []);

  const addTense = useCallback((tense: TenseExplanation) => {
    setNotebookData(prev => {
        if (prev.tenses.some(t => t.tenseName === tense.tenseName)) return prev;
        return { ...prev, tenses: [...prev.tenses, tense] };
    });
  }, []);

  const removeTense = useCallback((tenseName: string) => {
    setNotebookData(prev => ({ ...prev, tenses: prev.tenses.filter(t => t.tenseName !== tenseName) }));
  }, []);

  const addAcademicGrammar = useCallback((grammar: AcademicGrammarExplanation) => {
    setNotebookData(prev => {
        if (prev.academicGrammar.some(g => g.topicName === grammar.topicName)) return prev;
        return { ...prev, academicGrammar: [...prev.academicGrammar, grammar] };
    });
  }, []);

  const removeAcademicGrammar = useCallback((topicName: string) => {
    setNotebookData(prev => ({ ...prev, academicGrammar: prev.academicGrammar.filter(g => g.topicName !== topicName) }));
  }, []);

  const addEssay = useCallback((essay: SavedEssay) => {
    setNotebookData(prev => {
        if (prev.essays.some(e => e.id === essay.id)) return prev;
        return { ...prev, essays: [...prev.essays, essay] };
    });
  }, []);

  const removeEssay = useCallback((essayId: string) => {
    setNotebookData(prev => ({ ...prev, essays: prev.essays.filter(e => e.id !== essayId) }));
  }, []);

  const addTranslation = useCallback((translation: SavedTranslation) => {
    setNotebookData(prev => {
        if (prev.translations.some(t => t.id === translation.id)) return prev;
        return { ...prev, translations: [...prev.translations, translation] };
    });
  }, []);

  const removeTranslation = useCallback((translationId: string) => {
    setNotebookData(prev => ({ ...prev, translations: prev.translations.filter(t => t.id !== translationId) }));
  }, []);

  const addRephrasing = useCallback((rephrasing: SavedRephrasing) => {
    setNotebookData(prev => {
        if (prev.rephrasings.some(r => r.id === rephrasing.id)) return prev;
        return { ...prev, rephrasings: [...prev.rephrasings, rephrasing] };
    });
  }, []);

  const removeRephrasing = useCallback((rephrasingId: string) => {
    setNotebookData(prev => ({ ...prev, rephrasings: prev.rephrasings.filter(r => r.id !== rephrasingId) }));
  }, []);

  return {
    notebookData,
    updateNotes,
    addWord,
    removeWord,
    addTense,
    removeTense,
    addAcademicGrammar,
    removeAcademicGrammar,
    addEssay,
    removeEssay,
    addTranslation,
    removeTranslation,
    addRephrasing,
    removeRephrasing,
  };
};