import React, { useState } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { analyzeParagraph } from '../services/geminiService';
import type { ParagraphAnalysis } from '../types';

const getRoleColor = (role: string): string => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('topic sentence')) return 'bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-200';
    if (roleLower.includes('supporting detail')) return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
    if (roleLower.includes('example')) return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
    if (roleLower.includes('explanation')) return 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200';
    if (roleLower.includes('concluding sentence')) return 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200';
    if (roleLower.includes('transition')) return 'bg-slate-200 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200';
    return 'bg-slate-100 dark:bg-slate-800/50 text-slate-800 dark:text-slate-200';
};

const getRoleBorderColor = (role: string): string => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('topic sentence')) return 'border-sky-500';
    if (roleLower.includes('supporting detail')) return 'border-green-500';
    if (roleLower.includes('example')) return 'border-yellow-500';
    if (roleLower.includes('explanation')) return 'border-indigo-500';
    if (roleLower.includes('concluding sentence')) return 'border-purple-500';
    if (roleLower.includes('transition')) return 'border-slate-500';
    return 'border-slate-500';
};

export const ParagraphAnalyzerView: React.FC = () => {
    const [paragraph, setParagraph] = useState('');
    const [analysis, setAnalysis] = useState<ParagraphAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);

    const handleAnalyze = async () => {
        if (!paragraph.trim()) return;
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setSelectedSentenceIndex(null);
        try {
            const result = await analyzeParagraph(paragraph);
            // Basic validation to ensure we have sentences
            if (result && result.sentences && result.sentences.length > 0) {
                 setAnalysis(result);
            } else {
                throw new Error("Analysis returned no sentences.");
            }
        } catch (err) {
            console.error("Error analyzing paragraph:", err);
            setError("Paragraf analiz edilirken bir hata oluştu. Lütfen API yanıtını veya paragrafınızı kontrol edin.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="paragraph-input" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                            Analiz edilecek paragraf
                        </label>
                        <textarea
                            id="paragraph-input"
                            value={paragraph}
                            onChange={(e) => setParagraph(e.target.value)}
                            placeholder="İngilizce paragrafınızı buraya yapıştırın..."
                            className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] rounded-md h-48 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        onClick={handleAnalyze}
                        disabled={isLoading || !paragraph.trim()}
                    >
                        {isLoading ? 'Analiz Ediliyor...' : 'Analiz Et'}
                    </Button>
                </div>
            </Card>

            {isLoading && <Loader />}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {analysis && (
                <Card>
                    <h3 className="text-xl font-semibold mb-4">Analiz Sonuçları</h3>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold mb-2">Renklendirilmiş Paragraf</h4>
                            <div className="p-4 border border-[rgb(var(--border))] rounded-md leading-relaxed">
                                {analysis.sentences.map((s, i) => (
                                    <span 
                                        key={i} 
                                        className={`p-1 rounded cursor-pointer transition-all ${getRoleColor(s.role)} ${selectedSentenceIndex === i ? 'ring-2 ring-[rgb(var(--ring))] ring-offset-2 ring-offset-[rgb(var(--card))]' : ''}`}
                                        onClick={() => setSelectedSentenceIndex(i === selectedSentenceIndex ? null : i)}
                                    >
                                        {s.original}{' '}
                                    </span>
                                ))}
                            </div>
                             <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-sm text-[rgb(var(--muted-foreground))]">
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-sky-200 dark:bg-sky-800/50"></span>Ana Fikir</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-200 dark:bg-green-800/50"></span>Destekleyici Detay</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-200 dark:bg-yellow-800/50"></span>Örnek</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-indigo-200 dark:bg-indigo-800/50"></span>Açıklama</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-purple-200 dark:bg-purple-800/50"></span>Sonuç</div>
                                <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600/50"></span>Geçiş</div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Cümle Analizi</h4>
                            <div className="space-y-4">
                                {analysis.sentences.map((s, i) => (
                                    <div 
                                        key={i} 
                                        className={`p-3 border-l-4 rounded-r-md cursor-pointer transition-all bg-[rgb(var(--card))] hover:bg-[rgb(var(--muted))] ${getRoleBorderColor(s.role)} ${selectedSentenceIndex === i ? '!bg-[rgb(var(--muted))] shadow-md' : ''}`}
                                        onClick={() => setSelectedSentenceIndex(i === selectedSentenceIndex ? null : i)}
                                    >
                                         <div className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-block mb-2 ${getRoleColor(s.role)}`}>{s.role}</div>
                                        <p className="font-medium text-[rgb(var(--foreground))]"><strong>Original (Orijinal):</strong> {s.original}</p>
                                        <p className="text-[rgb(var(--muted-foreground))]"><strong>Simplified (Basitleştirilmiş):</strong> {s.simplified}</p>
                                        <p className="text-[rgb(var(--primary))] mt-1"><strong>Turkish Translation (Türkçe Çeviri):</strong> {s.turkishTranslation}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};