import type React from 'react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export interface ToolCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tools: Tool[];
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface DictionaryDefinition {
    english: string;
    turkish: string;
}

export interface DictionaryResult {
  pronunciation: string;
  definitions: DictionaryDefinition[];
  synonyms: { english: string[]; turkish: string[] };
  antonyms: { english: string[]; turkish: string[] };
  etymology: string;
}

export interface IdentifiedObject {
    englishName: string;
    turkishName: string;
}

export interface ListeningQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface ListeningPracticeContent {
    text: string;
    questions: ListeningQuestion[];
}

// Tense Module types
export interface TenseStructure {
    positive: string;
    negative: string;
    question: string;
}

export interface TenseUsage {
    use: string;
    example: string;
    translation: string;
}

export interface TenseExplanation {
    tenseName: string;
    structure: TenseStructure;
    usage: TenseUsage[];
}

export interface TenseReadingExercise {
    passage: string;
    questions: ListeningQuestion[];
}

export interface TenseListeningExercise {
    passage: string;
    questions: ListeningQuestion[];
}

export interface TenseWritingExercise {
    prompts: string[];
}

// New types for Academic Grammar Module
export interface AcademicGrammarUsage {
    use: string;
    example: string;
    translation: string;
}

export interface AcademicGrammarExplanation {
    topicName: string;
    explanation: string;
    usage: AcademicGrammarUsage[];
}

export interface AcademicGrammarReadingExercise {
    passage: string;
    answers: string[];
}

export interface AcademicGrammarListeningExercise {
    passage: string;
    answers: string[];
}

export interface AcademicGrammarWritingExercise {
    prompts: string[];
}

// Notebook types
export interface SavedWord {
    id: string; // word
    word: string;
    details: DictionaryResult;
    imageUrl: string | null;
}

export interface SavedEssay {
    id: string; // topic
    topic: string;
    content: string;
}

// Detailed Translator types
export interface AlternativeTranslation {
    translation: string;
    explanation: string;
}

export interface DetailedTranslation {
    directTranslation: string;
    grammarAnalysis: string;
    translationRationale: string;
    alternatives: AlternativeTranslation[];
    imageQueryKeyword: string;
}

export interface SavedTranslation {
    id: string; // original sentence
    translationData: DetailedTranslation;
    imageUrl: string | null;
}

// Sentence Rephraser types
export interface Rephrasing {
    style: string;
    sentence: string;
}

export interface SavedRephrasing {
    id: string; // The original sentence
    original: string;
    rephrasings: Rephrasing[];
}


export interface NotebookData {
    notes: string;
    vocabulary: SavedWord[];
    tenses: TenseExplanation[]; // Use TenseExplanation directly
    academicGrammar: AcademicGrammarExplanation[]; // Use AcademicGrammarExplanation directly
    essays: SavedEssay[];
    translations: SavedTranslation[];
    rephrasings: SavedRephrasing[];
}

// Paragraph Analyzer types
export interface AnalyzedSentence {
    original: string;
    simplified: string;
    role: string;
    turkishTranslation: string;
}

export interface ParagraphAnalysis {
    sentences: AnalyzedSentence[];
}

// Homework Helper types
export interface SolutionStep {
    stepNumber: number;
    title: string;
    explanation: string;
}

export interface IncorrectOption {
    option: string;
    reason: string;
}

export interface HomeworkSolution {
    correctAnswer: string;
    stepByStepSolution: SolutionStep[];
    mainExplanation: string;
    incorrectOptionsAnalysis: IncorrectOption[];
}

// Grammar Checker types
export interface GrammarError {
  errorText: string;
  correction: string;
  explanation: string;
  errorType: string;
}

export interface GrammarAnalysis {
  correctedText: string;
  errors: GrammarError[];
}

// Progress Tracker types
export interface ListeningAccuracy {
    correct: number;
    total: number;
}

export interface ProgressData {
    totalPracticeTime: number; // in seconds
    listeningAccuracy: ListeningAccuracy;
    essaysWritten: number;
    speakingSessions: number;
    practicedTenses: string[];
    practicedGrammarTopics: string[];
    grammarChecks: number;
    visitedTools: string[];
    pronunciationSessions: number;
    contentAnalyzed: number;
}

// Word of the Day types
export interface WordOfTheDayExample {
    english: string;
    turkish: string;
}

export interface WordOfTheDay {
    word: string;
    meaning: string;
    examples: WordOfTheDayExample[];
}

// Affix of the Day types
export interface AffixOfTheDayExample {
    word: string;
    definition: string;
}

export interface AffixOfTheDay {
    affix: string;
    type: 'Prefix' | 'Suffix';
    meaning: string;
    examples: AffixOfTheDayExample[];
}

// Pronunciation Coach types
export interface PronunciationMistake {
    mispronouncedWord: string;
    intendedWord: string;
    feedback: string;
}

export interface PronunciationFeedback {
    overallFeedback: string;
    mistakes: PronunciationMistake[];
}

// Content Analyzer types
export interface ContentVocabularyItem {
    word: string;
    definition: string; // Turkish definition
}

export interface ContentComprehensionQuestion {
    question: string;
    options: string[];
    correctAnswer: string; // The letter 'A', 'B', 'C', or 'D'
}

export interface ContentAnalysisResult {
    summary: string; // Turkish summary
    vocabulary: ContentVocabularyItem[];
    questions: ContentComprehensionQuestion[];
}

// Motivation & Gamification types
export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    isSecret?: boolean;
}

export interface WeeklyTask {
    task: string;
    completed: boolean;
}

export interface LearningPlan {
    generatedDate: string; // YYYY-MM-DD
    tasks: WeeklyTask[];
}

export interface MotivationData {
    lastLoginDate: string; // YYYY-MM-DD
    currentStreak: number;
    unlockedAchievements: string[];
    userLevel: string | null;
    userGoal: string | null;
    weeklyPlan: LearningPlan | null;
}

// Weather Widget type
export interface WeatherInfo {
    city: string;
    temperature: number;
    description: string; // Turkish description for display
    englishDescription: string; // English description for speech
    icon: string;
}

// Interactive Story types
export interface StorySegment {
    storyPart: string;
    choices: string[];
    imagePrompt: string;
    isEnding: boolean;
}

// Style & Tone Analyzer types
export interface ToneAnalysisSuggestion {
  original: string;
  suggested: string;
  reason: string; // Turkish reason
}

export interface ToneAnalysisResult {
  detectedTones: string[];
  overallAnalysis: string; // Turkish analysis
  revisedText: string;
  suggestions: ToneAnalysisSuggestion[];
}


// Fix: Add a global type definition for the Web Speech API to avoid conflicts between components.
// FIX: Export the SpeechRecognition interface so it can be imported and used in other components.
export interface SpeechRecognition {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: (event: any) => void;
  onend: () => void;
  onerror: (event: any) => void;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    jspdf: any;
    html2canvas: any;
  }
}