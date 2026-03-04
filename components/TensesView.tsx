import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { useNotebook } from '../hooks/useNotebook';
import { useProgress } from '../hooks/useProgress';
import {
  generateTenseExplanation,
  generateTenseReadingExercise,
  generateTenseListeningExercise,
  generateTenseWritingExercise,
  evaluateWrittenSentence
} from '../services/geminiService';
import type { TenseExplanation, TenseReadingExercise, TenseListeningExercise, TenseWritingExercise, ListeningQuestion } from '../types';

const TENSES = [
  'Present Simple', 'Present Continuous', 'Present Perfect', 'Present Perfect Continuous',
  'Past Simple', 'Past Continuous', 'Past Perfect', 'Past Perfect Continuous',
  'Future Simple', 'Future Continuous', 'Future Perfect', 'Future Perfect Continuous'
];

type Tab = 'explanation' | 'reading' | 'listening' | 'writing';

const TenseDetailView: React.FC<{ tense: string; onBack: () => void }> = ({ tense, onBack }) => {
    const [activeTab, setActiveTab] = useState<Tab>('explanation');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [explanation, setExplanation] = useState<TenseExplanation | null>(null);
    const [readingEx, setReadingEx] = useState<TenseReadingExercise | null>(null);
    const [listeningEx, setListeningEx] = useState<TenseListeningExercise | null>(null);
    const [writingEx, setWritingEx] = useState<TenseWritingExercise | null>(null);
    const { logTensePracticed } = useProgress();

    const fetchData = useCallback(async (tab: Tab) => {
        if (tab === 'explanation' && explanation) return;
        if (tab === 'reading' && readingEx) return;
        if (tab === 'listening' && listeningEx) return;
        if (tab === 'writing' && writingEx) return;

        setLoading(true);
        setError(null);
        try {
            switch (tab) {
                case 'explanation':
                    setExplanation(await generateTenseExplanation(tense));
                    break;
                case 'reading':
                    setReadingEx(await generateTenseReadingExercise(tense));
                    break;
                case 'listening':
                    setListeningEx(await generateTenseListeningExercise(tense));
                    break;
                case 'writing':
                    setWritingEx(await generateTenseWritingExercise(tense));
                    break;
            }
        } catch (err) {
            console.error(err);
            setError("İçerik yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, [tense, explanation, readingEx, listeningEx, writingEx]);

    useEffect(() => {
        logTensePracticed(tense);
    }, [tense, logTensePracticed]);

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, fetchData]);
    
    const renderContent = () => {
        if (loading) return <Loader />;
        if (error) return <p className="text-red-500">{error}</p>;

        switch(activeTab) {
            case 'explanation': return explanation && <ExplanationContent data={explanation} />;
            case 'reading': return readingEx && <ReadingContent data={readingEx} />;
            case 'listening': return listeningEx && <ListeningContent data={listeningEx} />;
            case 'writing': return writingEx && <WritingContent data={writingEx} tense={tense} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{tense}</h2>
                <Button variant="secondary" onClick={onBack}>Modüle Geri Dön</Button>
            </div>
            <Card>
                <div className="flex flex-wrap gap-2 border-b border-[rgb(var(--border))] pb-4">
                    <Button variant={activeTab === 'explanation' ? 'primary' : 'secondary'} onClick={() => setActiveTab('explanation')}>Açıklama</Button>
                    <Button variant={activeTab === 'reading' ? 'primary' : 'secondary'} onClick={() => setActiveTab('reading')}>Okuma Alıştırması</Button>
                    <Button variant={activeTab === 'listening' ? 'primary' : 'secondary'} onClick={() => setActiveTab('listening')}>Dinleme Alıştırması</Button>
                    <Button variant={activeTab === 'writing' ? 'primary' : 'secondary'} onClick={() => setActiveTab('writing')}>Yazma Alıştırması</Button>
                </div>
                <div className="mt-4 min-h-[200px]">
                    {renderContent()}
                </div>
            </Card>
        </div>
    );
};

const ExplanationContent: React.FC<{ data: TenseExplanation }> = ({ data }) => {
    const { notebookData, addTense } = useNotebook();
    const isSaved = notebookData.tenses.some(t => t.tenseName === data.tenseName);

    const handleSave = () => {
        addTense(data);
    };

    return (
        <div className="space-y-6 prose dark:prose-invert max-w-none text-[rgb(var(--foreground))]">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg not-prose">Yapısı</h3>
                 <Button onClick={handleSave} disabled={isSaved} variant="secondary">
                    {isSaved ? 'Kaydedildi' : 'Açıklamayı Kaydet'}
                </Button>
            </div>
            <ul className="list-disc list-inside">
                <li><strong>Olumlu:</strong> {data.structure.positive}</li>
                <li><strong>Olumsuz:</strong> {data.structure.negative}</li>
                <li><strong>Soru:</strong> {data.structure.question}</li>
            </ul>

            <div>
                <h3 className="font-semibold text-lg not-prose">Kullanım Alanları</h3>
                {data.usage.map((use, index) => (
                    <div key={index} className="mt-4 p-3 bg-[rgb(var(--muted))] rounded-md not-prose">
                        <p className="font-semibold">{use.use}</p>
                        <p className="italic">"{use.example}"</p>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">({use.translation})</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const ComprehensionQuiz: React.FC<{ questions: ListeningQuestion[] }> = ({ questions }) => {
    const [answers, setAnswers] = useState<{[key: number]: string}>({});
    const [submitted, setSubmitted] = useState(false);

    const handleAnswerChange = (qIndex: number, optionLetter: string) => {
        setAnswers(prev => ({ ...prev, [qIndex]: optionLetter }));
    };

    const checkAnswers = () => {
        setSubmitted(true);
    };

    const getOptionClass = (qIndex: number, optionLetter: string, correctAnswer: string) => {
        if (!submitted) return '';
        if (optionLetter === correctAnswer) return 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100';
        if (answers[qIndex] === optionLetter && optionLetter !== correctAnswer) return 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100';
        return 'bg-[rgb(var(--muted))]';
    };

    return (
        <div className="space-y-6">
            <h4 className="font-semibold text-lg">Sorular</h4>
            <div className="space-y-6">
                {questions.map((q, qIndex) => (
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
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>
            {!submitted && questions.length > 0 && <Button onClick={checkAnswers} className="mt-6">Cevapları Kontrol Et</Button>}
            {submitted && (
                <Button onClick={() => { setAnswers({}); setSubmitted(false); }} className="mt-6">Tekrar Dene</Button>
            )}
        </div>
    );
};


const ReadingContent: React.FC<{ data: TenseReadingExercise }> = ({ data }) => (
    <div className="space-y-6">
        <div>
            <h4 className="font-semibold text-lg mb-2">Okuma Metni</h4>
            <p className="p-4 bg-[rgb(var(--muted))] rounded-md whitespace-pre-wrap">{data.passage}</p>
        </div>
        <ComprehensionQuiz questions={data.questions} />
    </div>
);

const ListeningContent: React.FC<{ data: TenseListeningExercise }> = ({ data }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    const handlePlay = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        const utterance = new SpeechSynthesisUtterance(data.passage);
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
            <div>
                <h4 className="font-semibold text-lg mb-2">Dinleme Metni</h4>
                <Button onClick={handlePlay} disabled={isSpeaking}>
                    {isSpeaking ? "Dinleniyor..." : "Metni Dinle"}
                </Button>
            </div>
            <ComprehensionQuiz questions={data.questions} />
        </div>
    );
};

const WritingContent: React.FC<{ data: TenseWritingExercise, tense: string }> = ({ data, tense }) => {
    const [sentence, setSentence] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGetFeedback = async () => {
        if (!sentence.trim()) return;
        setLoading(true);
        setFeedback('');
        try {
            const result = await evaluateWrittenSentence(sentence, tense);
            setFeedback(result);
        } catch (err) {
            console.error(err);
            setFeedback("Değerlendirme alınamadı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h4 className="font-semibold">Aşağıdaki konulardan birini seçerek bir cümle yazın:</h4>
                <ul className="list-disc list-inside text-[rgb(var(--muted-foreground))]">
                    {data.prompts.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
            </div>
            <textarea
                value={sentence}
                onChange={(e) => setSentence(e.target.value)}
                placeholder="Cümlenizi buraya yazın..."
                className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md h-24 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                disabled={loading}
            />
            <Button onClick={handleGetFeedback} disabled={loading || !sentence.trim()}>
                {loading ? "Değerlendiriliyor..." : "Değerlendir"}
            </Button>
            {feedback && (
                 <Card className="bg-[rgb(var(--muted))]">
                    <h4 className="font-semibold">Geri Bildirim</h4>
                    <p className="whitespace-pre-wrap">{feedback}</p>
                 </Card>
            )}
        </div>
    );
};


export const TensesView: React.FC = () => {
  const [selectedTense, setSelectedTense] = useState<string | null>(null);

  if (selectedTense) {
    return <TenseDetailView tense={selectedTense} onBack={() => setSelectedTense(null)} />;
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">Bir Zaman Seçin</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TENSES.map(tense => (
          <Button key={tense} variant="secondary" onClick={() => setSelectedTense(tense)}>
            {tense}
          </Button>
        ))}
      </div>
    </Card>
  );
};
