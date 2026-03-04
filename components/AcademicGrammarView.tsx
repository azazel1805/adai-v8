import React, { useState, useEffect, useCallback } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { useNotebook } from '../hooks/useNotebook';
import { useProgress } from '../hooks/useProgress';
import {
  generateAcademicGrammarExplanation,
  generateAcademicGrammarReadingExercise,
  generateAcademicGrammarListeningExercise,
  generateAcademicGrammarWritingExercise,
  evaluateWrittenAcademicSentence
} from '../services/geminiService';
import type { AcademicGrammarExplanation, AcademicGrammarReadingExercise, AcademicGrammarListeningExercise, AcademicGrammarWritingExercise } from '../types';

const ACADEMIC_TOPICS = [
  'If Clauses (Conditionals)',
  'Relative Clauses',
  'Noun Clauses',
  'Conjunctions',
  'Comparatives & Superlatives',
  'Passive Voice'
];

type Tab = 'explanation' | 'reading' | 'listening' | 'writing';

const AcademicGrammarDetailView: React.FC<{ topic: string; onBack: () => void }> = ({ topic, onBack }) => {
    const [activeTab, setActiveTab] = useState<Tab>('explanation');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [explanation, setExplanation] = useState<AcademicGrammarExplanation | null>(null);
    const [readingEx, setReadingEx] = useState<AcademicGrammarReadingExercise | null>(null);
    const [listeningEx, setListeningEx] = useState<AcademicGrammarListeningExercise | null>(null);
    const [writingEx, setWritingEx] = useState<AcademicGrammarWritingExercise | null>(null);
    const { logGrammarTopicPracticed } = useProgress();

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
                    setExplanation(await generateAcademicGrammarExplanation(topic));
                    break;
                case 'reading':
                    setReadingEx(await generateAcademicGrammarReadingExercise(topic));
                    break;
                case 'listening':
                    setListeningEx(await generateAcademicGrammarListeningExercise(topic));
                    break;
                case 'writing':
                    setWritingEx(await generateAcademicGrammarWritingExercise(topic));
                    break;
            }
        } catch (err) {
            console.error(err);
            setError("İçerik yüklenirken bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    }, [topic, explanation, readingEx, listeningEx, writingEx]);

    useEffect(() => {
        logGrammarTopicPracticed(topic);
    }, [topic, logGrammarTopicPracticed]);

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
            case 'writing': return writingEx && <WritingContent data={writingEx} topic={topic} />;
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{topic}</h2>
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

const ExplanationContent: React.FC<{ data: AcademicGrammarExplanation }> = ({ data }) => {
    const { notebookData, addAcademicGrammar } = useNotebook();
    const isSaved = notebookData.academicGrammar.some(g => g.topicName === data.topicName);

    const handleSave = () => {
        addAcademicGrammar(data);
    };

    return (
        <div className="space-y-6 prose dark:prose-invert max-w-none text-[rgb(var(--foreground))]">
            <div className="flex justify-between items-center">
                 <h3 className="font-semibold text-lg not-prose">Açıklama</h3>
                 <Button onClick={handleSave} disabled={isSaved} variant="secondary">
                    {isSaved ? 'Kaydedildi' : 'Açıklamayı Kaydet'}
                </Button>
            </div>
            <p>{data.explanation}</p>
            
            <div>
                <h3 className="font-semibold text-lg not-prose">Kullanım Alanları ve Türleri</h3>
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

const Exercise: React.FC<{
    passage: string;
    answers: string[];
    children?: React.ReactNode;
}> = ({ passage, answers, children }) => {
    const [userAnswers, setUserAnswers] = useState<string[]>(Array(answers.length).fill(''));
    const [submitted, setSubmitted] = useState(false);

    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...userAnswers];
        newAnswers[index] = value;
        setUserAnswers(newAnswers);
    };

    const parts = passage.split(/{\d+}/g);
    const blanks = answers.map((_, i) => i);

    const getBorderColor = (index: number) => {
        if (!submitted) return 'border-[rgb(var(--border))]';
        return userAnswers[index].toLowerCase().trim() === answers[index].toLowerCase().trim() ? 'border-green-500' : 'border-red-500';
    };

    return (
        <div className="space-y-4">
            {children}
            <div className="text-lg leading-relaxed">
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part}
                        {index < blanks.length && (
                            <input
                                type="text"
                                value={userAnswers[index]}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                disabled={submitted}
                                className={`inline-block w-32 mx-1 p-1 border-b-2 bg-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--primary))] text-[rgb(var(--foreground))] ${getBorderColor(index)}`}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>
            {!submitted && <Button onClick={() => setSubmitted(true)}>Cevapları Kontrol Et</Button>}
            {submitted && (
                <div className="p-3 bg-[rgb(var(--muted))] rounded-md">
                    <p>Doğru Cevaplar: {answers.join(', ')}</p>
                </div>
            )}
        </div>
    );
};

const ReadingContent: React.FC<{ data: AcademicGrammarReadingExercise }> = ({ data }) => (
    <Exercise passage={data.passage} answers={data.answers} />
);

const ListeningContent: React.FC<{ data: AcademicGrammarListeningExercise }> = ({ data }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);
    
    const getFullText = () => {
        let full = data.passage;
        data.answers.forEach((ans, i) => {
            full = full.replace(`{${i}}`, ans);
        });
        return full;
    };

    const handlePlay = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            return;
        }
        const textToSpeak = getFullText();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
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
        <Exercise passage={data.passage} answers={data.answers}>
            <div className="mb-4">
                <Button onClick={handlePlay} disabled={isSpeaking}>
                    {isSpeaking ? "Dinleniyor..." : "Dinlemek için Tıkla"}
                </Button>
            </div>
        </Exercise>
    );
};

const WritingContent: React.FC<{ data: AcademicGrammarWritingExercise, topic: string }> = ({ data, topic }) => {
    const [sentence, setSentence] = useState('');
    const [feedback, setFeedback] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGetFeedback = async () => {
        if (!sentence.trim()) return;
        setLoading(true);
        setFeedback('');
        try {
            const result = await evaluateWrittenAcademicSentence(sentence, topic);
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


export const AcademicGrammarView: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  if (selectedTopic) {
    return <AcademicGrammarDetailView topic={selectedTopic} onBack={() => setSelectedTopic(null)} />;
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold mb-4">Bir Konu Seçin</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACADEMIC_TOPICS.map(topic => (
          <Button key={topic} variant="secondary" onClick={() => setSelectedTopic(topic)}>
            {topic}
          </Button>
        ))}
      </div>
    </Card>
  );
};