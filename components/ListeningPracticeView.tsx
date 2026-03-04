import React, { useState, useEffect } from 'react';
import { generateListeningPractice } from '../services/geminiService';
import type { ListeningPracticeContent } from '../types';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { Card } from './common/Card';
import { useProgress } from '../hooks/useProgress';


export const ListeningPracticeView: React.FC = () => {
  const [level, setLevel] = useState('B1');
  const [content, setContent] = useState<ListeningPracticeContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [submitted, setSubmitted] = useState(false);
  const [showText, setShowText] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const { logListeningResult } = useProgress();

  useEffect(() => {
    const loadVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
    };
  }, []);

  const handleGenerate = async () => {
    setIsLoading(true);
    setContent(null);
    setAnswers({});
    setSubmitted(false);
    setShowText(false);
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }
    try {
      const practiceContent = await generateListeningPractice(level);
      setContent(practiceContent);
    } catch (error) {
      console.error("Error generating listening practice:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (qIndex: number, option: string) => {
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };
  
  const checkAnswers = () => {
    if (!content) return;
    setSubmitted(true);

    let correctCount = 0;
    content.questions.forEach((q, qIndex) => {
        const selectedAnswerLetter = answers[qIndex];
        if (selectedAnswerLetter && selectedAnswerLetter === q.correctAnswer) {
            correctCount++;
        }
    });
    logListeningResult(correctCount, content.questions.length);
  };
  
  const getOptionClass = (qIndex: number, option: string, correctAnswer: string) => {
    if (!submitted) return 'bg-[rgb(var(--muted))] hover:bg-[rgb(var(--accent))]';
    if (option === correctAnswer) return 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100';
    if (answers[qIndex] === option && option !== correctAnswer) return 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100';
    return 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]';
  };

  const handleListen = () => {
    if (!content || !('speechSynthesis' in window) || isSpeaking) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(content.text);
    
    const femaleVoice = voices.find(
        (voice) => voice.lang === 'en-US' && (voice.name.includes('Female') || voice.name.includes('Google US English') || voice.name.includes('Zira') || voice.name.includes('Samantha'))
    );
    
    utterance.voice = femaleVoice || voices.find(v => v.lang === 'en-US') || null;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
        console.error("SpeechSynthesis Error", e);
        setIsSpeaking(false);
    };
    
    window.speechSynthesis.speak(utterance);
  };


  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-4">
          <select value={level} onChange={(e) => setLevel(e.target.value)} className="p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none">
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
            <option value="C1">C1</option>
          </select>
          <Button onClick={handleGenerate} disabled={isLoading}>
            {isLoading ? 'Oluşturuluyor...' : 'Yeni Oluştur'}
          </Button>
        </div>
      </Card>
      
      {isLoading && <Loader />}

      {content && (
        <>
          <Card>
            <h3 className="text-xl font-semibold mb-4">Dinleme Metni</h3>
            <Button onClick={handleListen} disabled={isSpeaking}>
                {isSpeaking ? 'Dinleniyor...' : 'Metni Dinle'}
            </Button>
            <div className="mt-4">
                <Button variant="secondary" onClick={() => setShowText(!showText)}>
                    {showText ? 'Metni Gizle' : 'Metni Göster'}
                </Button>
                {showText && (
                    <p className="mt-4 text-[rgb(var(--foreground))] bg-[rgba(var(--muted),0.5)] p-4 rounded-md">
                        {content.text}
                    </p>
                )}
            </div>
          </Card>
          <Card>
            <h3 className="text-xl font-semibold mb-4">Sorular</h3>
            <div className="space-y-6">
              {content.questions.map((q, qIndex) => (
                <div key={qIndex}>
                  <p className="font-semibold mb-2">{qIndex + 1}. {q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oIndex) => {
                      const optionLetter = String.fromCharCode(65 + oIndex);
                      return (
                      <button 
                        key={oIndex}
                        onClick={() => !submitted && handleAnswerChange(qIndex, optionLetter)}
                        className={`w-full text-left p-3 rounded-md transition-colors ${
                            submitted ? getOptionClass(qIndex, optionLetter, q.correctAnswer) :
                            (answers[qIndex] === optionLetter ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]' : 'bg-[rgb(var(--muted))] hover:bg-[rgb(var(--accent))]')
                        }`}
                        disabled={submitted}
                      >
                        {optionLetter}. {opt}
                      </button>
                    )})}
                  </div>
                </div>
              ))}
            </div>
            {!submitted && <Button onClick={checkAnswers} className="mt-6">Cevapları Kontrol Et</Button>}
          </Card>
        </>
      )}
    </div>
  );
};