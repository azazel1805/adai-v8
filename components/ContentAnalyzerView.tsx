import React, { useState } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { analyzeContentFromText } from '../services/geminiService';
import type { ContentAnalysisResult } from '../types';
import { useProgress } from '../hooks/useProgress';

type AnalyzeMode = 'text' | 'url';

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
);


export const ContentAnalyzerView: React.FC = () => {
    const [mode, setMode] = useState<AnalyzeMode>('text');
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [analysis, setAnalysis] = useState<ContentAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [urlError, setUrlError] = useState<string | null>(null);
    const { logContentAnalyzed } = useProgress();

    // State for the quiz part
    const [answers, setAnswers] = useState<{[key: number]: string}>({});
    const [submitted, setSubmitted] = useState(false);

    const handleAnalyze = async () => {
        if (mode === 'url') {
            if (!url.trim()) return;
            setUrlError("Doğrudan URL'den içerik çekme teknik kısıtlamalar (CORS politikaları) nedeniyle şu anda mümkün değildir. Lütfen ilgili metni kopyalayıp 'Metin Yapıştır' sekmesine yapıştırarak devam edin.");
            setError(null);
            setAnalysis(null);
            return;
        }

        if (!text.trim()) return;
        setIsLoading(true);
        setError(null);
        setUrlError(null);
        setAnalysis(null);
        setAnswers({});
        setSubmitted(false);

        try {
            const result = await analyzeContentFromText(text);
            setAnalysis(result);
            logContentAnalyzed();
        } catch (err) {
            console.error("Error analyzing content:", err);
            setError("İçerik analiz edilirken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = (newMode: AnalyzeMode) => {
        setMode(newMode);
        setError(null);
        setUrlError(null);
        setAnalysis(null);
    };
    
    // Quiz logic copied & adapted from ListeningPracticeView
    const handleAnswerChange = (qIndex: number, option: string) => {
        setAnswers(prev => ({ ...prev, [qIndex]: option }));
    };
    
    const checkAnswers = () => {
        if (!analysis) return;
        setSubmitted(true);
    };

    const getOptionClass = (qIndex: number, option: string, correctAnswer: string) => {
        if (!submitted || !analysis) return 'bg-[rgb(var(--muted))] hover:bg-[rgb(var(--accent))]';
        const optionLetter = String.fromCharCode(65 + analysis.questions[qIndex].options.indexOf(option));
        if (optionLetter === correctAnswer) return 'bg-green-200 dark:bg-green-800 text-green-900 dark:text-green-100';
        if (answers[qIndex] === optionLetter && optionLetter !== correctAnswer) return 'bg-red-200 dark:bg-red-800 text-red-900 dark:text-red-100';
        return 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]';
    };


    return (
        <div className="space-y-6">
            <Card>
                 <div className="flex border-b border-[rgb(var(--border))] mb-4">
                    <button onClick={() => switchMode('text')} className={`px-4 py-2 font-semibold transition-colors duration-200 ${mode === 'text' ? 'border-b-2 border-[rgb(var(--primary))] text-[rgb(var(--primary))]' : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'}`}>Metin Yapıştır</button>
                    <button onClick={() => switchMode('url')} className={`px-4 py-2 font-semibold transition-colors duration-200 ${mode === 'url' ? 'border-b-2 border-[rgb(var(--primary))] text-[rgb(var(--primary))]' : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'}`}>URL'den Getir</button>
                </div>
                
                <div className="space-y-4">
                    {mode === 'text' ? (
                         <div>
                            <label htmlFor="content-input" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                               Analiz edilecek metin (İngilizce makale, video transkripti vb.)
                            </label>
                            <textarea
                                id="content-input"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Metni buraya yapıştırın..."
                                className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md h-48 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                                disabled={isLoading}
                            />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="url-input" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                                YouTube videosu veya haber makalesi linki
                            </label>
                            <input
                                id="url-input"
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://www.youtube.com/watch?v=..."
                                className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                                disabled={isLoading}
                            />
                        </div>
                    )}
                   
                    <Button
                        onClick={handleAnalyze}
                        disabled={isLoading || (mode === 'text' && !text.trim()) || (mode === 'url' && !url.trim())}
                    >
                        {isLoading ? 'Analiz Ediliyor...' : 'Analiz Et'}
                    </Button>
                </div>
            </Card>

            {urlError && (
                 <Card className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20">
                    <div className="flex items-start gap-3">
                        <InfoIcon className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <div>
                           <p className="font-semibold text-amber-800 dark:text-amber-200">Bilgilendirme</p>
                           <p className="text-amber-700 dark:text-amber-300">{urlError}</p>
                           <Button variant="secondary" onClick={() => switchMode('text')} className="mt-4 !bg-amber-100 dark:!bg-amber-800/50 hover:!bg-amber-200 dark:hover:!bg-amber-800">
                                Metin Yapıştırmaya Geç
                           </Button>
                        </div>
                    </div>
                 </Card>
            )}

            {isLoading && <Loader />}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {analysis && (
                <div className="space-y-6">
                    {/* Summary */}
                    <Card>
                        <h3 className="text-xl font-semibold mb-2 text-[rgb(var(--foreground))]">Özet (Türkçe)</h3>
                        <p className="text-[rgb(var(--muted-foreground))]">{analysis.summary}</p>
                    </Card>

                    {/* Vocabulary */}
                    <Card>
                        <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--foreground))]">Önemli Kelimeler</h3>
                        <ul className="space-y-3">
                            {analysis.vocabulary.map((item, index) => (
                                <li key={index} className="flex items-baseline">
                                    <span className="font-semibold text-[rgb(var(--foreground))] mr-2">{item.word}:</span>
                                    <span className="text-[rgb(var(--muted-foreground))]">{item.definition}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Comprehension Questions */}
                    <Card>
                        <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--foreground))]">Anlama Soruları</h3>
                         <div className="space-y-6">
                            {analysis.questions.map((q, qIndex) => (
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
                                            submitted ? getOptionClass(qIndex, opt, q.correctAnswer) :
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
                        {!submitted && analysis.questions.length > 0 && <Button onClick={checkAnswers} className="mt-6">Cevapları Kontrol Et</Button>}
                    </Card>
                </div>
            )}
        </div>
    );
};