import React, { useState, useEffect } from 'react';
import { HomeView } from './components/HomeView';
import { AITutorView } from './components/AITutorView';
import { EssayHelperView } from './components/EssayHelperView';
import { ListeningPracticeView } from './components/ListeningPracticeView';
import { SpeakingSimulatorView } from './components/SpeakingSimulatorView';
import { PodcastCreatorView } from './components/PodcastCreatorView';
import { DictionaryView } from './components/DictionaryView';
import { TensesView } from './components/TensesView';
import { AcademicGrammarView } from './components/AcademicGrammarView';
import { NotebookView } from './components/NotebookView';
import { SentenceRephraserView } from './components/SentenceRephraserView';
import { ParagraphAnalyzerView } from './components/ParagraphAnalyzerView';
import { DetailedTranslatorView } from './components/DetailedTranslatorView';
import { HomeworkHelperView } from './components/HomeworkHelperView';
import { GrammarCheckerView } from './components/GrammarCheckerView';
import { ProgressTrackerView } from './components/ProgressTrackerView';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { HamburgerMenu } from './components/HamburgerMenu';
import { PronunciationCoachView } from './components/PronunciationCoachView';
import { ContentAnalyzerView } from './components/ContentAnalyzerView';
import { MotivationView } from './components/MotivationView';
import { InteractiveStoryView } from './components/InteractiveStoryView';
import { StyleToneAnalyzerView } from './components/StyleToneAnalyzerView';
import { SentenceScramblerView } from './components/SentenceScramblerView';
import type { Tool } from './types';
import { useMotivation } from './hooks/useMotivation';
import { useProgress } from './hooks/useProgress';

const HamburgerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { checkStreak } = useMotivation();
  const { logToolVisit } = useProgress();

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);
  
  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  // Global theme handler
  useEffect(() => {
    const applyTheme = () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        // Only applies if theme is set to 'system' (i.e., no value in localStorage)
        if (!localStorage.getItem('theme')) {
            applyTheme();
        }
    };
    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('storage', applyTheme); // Listen for changes from other tabs

    return () => {
        mediaQuery.removeEventListener('change', handleChange);
        window.removeEventListener('storage', applyTheme);
    }
  }, []);

  const handleSelectTool = (tool: Tool | null) => {
    setActiveTool(tool);
    setIsMenuOpen(false);
    if (tool) {
        logToolVisit(tool.id);
    }
  };

  const renderActiveTool = () => {
    if (!activeTool) return <HomeView onSelectTool={handleSelectTool} />;
    switch (activeTool.id) {
      case 'ai-tutor': return <AITutorView />;
      case 'essay-helper': return <EssayHelperView />;
      case 'listening-practice': return <ListeningPracticeView />;
      case 'speaking-simulator': return <SpeakingSimulatorView />;
      case 'pronunciation-coach': return <PronunciationCoachView />;
      case 'sentence-scrambler': return <SentenceScramblerView />;
      case 'interactive-story': return <InteractiveStoryView />;
      case 'podcast-creator': return <PodcastCreatorView />;
      case 'dictionary': return <DictionaryView />;
      case 'tenses-module': return <TensesView />;
      case 'academic-grammar-module': return <AcademicGrammarView />;
      case 'notebook': return <NotebookView />;
      case 'sentence-rephraser': return <SentenceRephraserView />;
      case 'paragraph-analyzer': return <ParagraphAnalyzerView />;
      case 'detailed-translator': return <DetailedTranslatorView />;
      case 'homework-helper': return <HomeworkHelperView />;
      case 'grammar-checker': return <GrammarCheckerView />;
      case 'style-tone-analyzer': return <StyleToneAnalyzerView />;
      case 'progress-tracker': return <ProgressTrackerView />;
      case 'motivation-goals': return <MotivationView />;
      case 'settings': return <SettingsView />;
      case 'content-analyzer': return <ContentAnalyzerView />;
      default: return <HomeView onSelectTool={handleSelectTool} />;
    }
  };

  return (
    <div className="h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))] flex font-sans overflow-hidden">
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar activeTool={activeTool} onSelectTool={handleSelectTool} />
      </div>
      <HamburgerMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectTool={handleSelectTool}
      />

      <div className="flex-1 flex flex-col min-h-0">
        <header className="flex-shrink-0 bg-[rgba(var(--background),0.8)] backdrop-blur-sm border-b border-[rgb(var(--border))] z-10 sticky top-0 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="md:hidden p-2 rounded-md text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[rgb(var(--ring))]"
                aria-label="Open menu"
              >
                <HamburgerIcon className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                {activeTool && <span className="text-2xl hidden sm:block text-[rgb(var(--primary))]">{activeTool.icon}</span>}
                <h1 className="text-lg sm:text-xl font-bold truncate">{activeTool ? activeTool.name : "Dashboard"}</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {activeTool ? (
              <div className="h-full flex flex-col">
                <p className="flex-shrink-0 text-[rgb(var(--muted-foreground))] mb-6">{activeTool.description}</p>
                <div className="flex-1 min-h-0">
                  {renderActiveTool()}
                </div>
              </div>
            ) : (
              <HomeView onSelectTool={handleSelectTool} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;