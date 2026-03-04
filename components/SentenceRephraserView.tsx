import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { rephraseSentence } from '../services/geminiService';
import type { Rephrasing } from '../types';
import { useNotebook } from '../hooks/useNotebook';

const REPHRASE_STYLES = ['Simpler', 'Formal', 'Informal', 'Slang', 'Complex'];

const CopyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 0v-3.5m0 3.5a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);


export const SentenceRephraserView: React.FC = () => {
    const [sentence, setSentence] = useState('');
    const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
    const [results, setResults] = useState<Rephrasing[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const { notebookData, addRephrasing } = useNotebook();
    
    useEffect(() => {
        if (sentence && notebookData.rephrasings.some(r => r.id === sentence)) {
            setIsSaved(true);
        } else {
            setIsSaved(false);
        }
    }, [sentence, results, notebookData.rephrasings]);


    const handleStyleToggle = (style: string) => {
        setSelectedStyles(prev =>
            prev.includes(style)
                ? prev.filter(s => s !== style)
                : [...prev, style]
        );
    };

    const handleRephrase = async () => {
        if (!sentence.trim() || selectedStyles.length === 0) return;
        setIsLoading(true);
        setError(null);
        setResults([]);
        setIsSaved(false);
        try {
            const rephrasings = await rephraseSentence(sentence, selectedStyles);
            setResults(rephrasings);
        } catch (err) {
            console.error("Error rephrasing sentence:", err);
            setError("Cümle yeniden yazılırken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };
    
    const handleSave = () => {
        if (results.length > 0 && sentence) {
            addRephrasing({
                id: sentence,
                original: sentence,
                rephrasings: results,
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="sentence-input" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                            Yeniden yazılacak cümle
                        </label>
                        <textarea
                            id="sentence-input"
                            value={sentence}
                            onChange={(e) => setSentence(e.target.value)}
                            placeholder="Cümlenizi buraya girin..."
                            className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md h-24 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <p className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-2">
                            Yeniden yazma stilleri seçin
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {REPHRASE_STYLES.map(style => (
                                <Button
                                    key={style}
                                    variant={selectedStyles.includes(style) ? 'primary' : 'secondary'}
                                    onClick={() => handleStyleToggle(style)}
                                    disabled={isLoading}
                                >
                                    {style}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <Button
                        onClick={handleRephrase}
                        disabled={isLoading || !sentence.trim() || selectedStyles.length === 0}
                    >
                        {isLoading ? 'Yeniden Yazılıyor...' : 'Yeniden Yaz'}
                    </Button>
                </div>
            </Card>

            {isLoading && <Loader />}
            {error && <p className="text-red-500">{error}</p>}

            {results.length > 0 && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold">Sonuçlar</h3>
                        <Button onClick={handleSave} disabled={isSaved} variant="secondary">
                            {isSaved ? 'Kaydedildi' : 'Kaydet'}
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {results.map((result, index) => (
                            <div key={index} className="p-4 bg-[rgb(var(--muted))] rounded-md">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-semibold text-[rgb(var(--foreground))]">{result.style}</h4>
                                     <Button variant="secondary" onClick={() => handleCopy(result.sentence, index)} className="p-2 h-auto text-sm">
                                        {copiedIndex === index ? 'Kopyalandı!' : <CopyIcon className="w-4 h-4" />}
                                    </Button>
                                </div>
                                <p className="text-[rgb(var(--muted-foreground))]">{result.sentence}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
};