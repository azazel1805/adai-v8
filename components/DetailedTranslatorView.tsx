import React, { useState, useEffect } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { getDetailedTranslation } from '../services/geminiService';
import { getImageForWord } from '../services/pexelsService';
import { useNotebook } from '../hooks/useNotebook';
import type { DetailedTranslation } from '../types';

export const DetailedTranslatorView: React.FC = () => {
    const [sentence, setSentence] = useState('');
    const [result, setResult] = useState<DetailedTranslation | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);
    const { notebookData, addTranslation } = useNotebook();

    useEffect(() => {
        if (sentence && notebookData.translations.some(t => t.id === sentence)) {
            setIsSaved(true);
        } else {
            setIsSaved(false);
        }
    }, [sentence, result, notebookData.translations]);


    const handleTranslate = async () => {
        if (!sentence.trim()) return;
        setIsLoading(true);
        setError(null);
        setResult(null);
        setImageUrl(null);
        try {
            const translationData = await getDetailedTranslation(sentence);
            setResult(translationData);
            if (translationData.imageQueryKeyword) {
                const image = await getImageForWord(translationData.imageQueryKeyword);
                setImageUrl(image);
            }
        } catch (err) {
            console.error("Error getting detailed translation:", err);
            setError("Çeviri ve analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleSave = () => {
        if (result) {
            addTranslation({
                id: sentence,
                translationData: result,
                imageUrl: imageUrl,
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="sentence-input" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                            Çevrilecek cümle (İngilizce veya Türkçe)
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
                    <Button
                        onClick={handleTranslate}
                        disabled={isLoading || !sentence.trim()}
                    >
                        {isLoading ? 'Çevriliyor...' : 'Çevir ve Analiz Et'}
                    </Button>
                </div>
            </Card>

            {isLoading && <Loader />}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {result && (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold">Analiz Sonuçları</h3>
                        <Button onClick={handleSave} disabled={isSaved} variant="secondary">
                            {isSaved ? 'Kaydedildi' : 'Çeviriyi Kaydet'}
                        </Button>
                    </div>

                    {imageUrl && (
                        <div className="mb-6">
                             <img src={imageUrl} alt={result.imageQueryKeyword} className="rounded-lg object-cover w-full h-auto max-h-80" />
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Direct Translation */}
                        <div>
                            <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">Doğrudan Çeviri</h4>
                            <p className="text-lg p-3 bg-[rgb(var(--muted))] rounded-md">{result.directTranslation}</p>
                        </div>

                        {/* Grammar Analysis */}
                        <div>
                            <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">Gramer Analizi (Orijinal Cümle)</h4>
                            <p className="p-3 bg-[rgb(var(--muted))] rounded-md whitespace-pre-wrap">{result.grammarAnalysis}</p>
                        </div>

                        {/* Translation Rationale */}
                        <div>
                            <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">Çeviri Gerekçesi</h4>
                            <p className="p-3 bg-[rgb(var(--muted))] rounded-md whitespace-pre-wrap">{result.translationRationale}</p>
                        </div>

                        {/* Alternative Translations */}
                        <div>
                            <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">Alternatif Çeviriler</h4>
                            <div className="space-y-3">
                                {result.alternatives.map((alt, index) => (
                                    <div key={index} className="border-l-4 border-[rgb(var(--primary))] pl-4">
                                        <p className="font-semibold text-lg">{alt.translation}</p>
                                        <p className="text-[rgb(var(--muted-foreground))]">{alt.explanation}</p>
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