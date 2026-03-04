import React, { useState, useEffect, useMemo } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { generateScrambledSentence } from '../services/geminiService';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];

const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
};

// Icons
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /> </svg> );
const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg> );

interface Word {
    text: string;
    id: number;
}

export const SentenceScramblerView: React.FC = () => {
    const [level, setLevel] = useState('B1');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [originalSentence, setOriginalSentence] = useState('');
    const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
    const [userWords, setUserWords] = useState<Word[]>([]);
    
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'checked'>('idle');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const availableWords = useMemo(() => {
        const userWordIds = new Set(userWords.map(w => w.id));
        return shuffledWords.filter(w => !userWordIds.has(w.id));
    }, [userWords, shuffledWords]);

    const handleGetSentence = async () => {
        setIsLoading(true);
        setError(null);
        setGameState('playing');
        setOriginalSentence('');
        setShuffledWords([]);
        setUserWords([]);
        setIsCorrect(null);

        try {
            const { sentence } = await generateScrambledSentence(level);
            const words = sentence.split(' ').map((text, id) => ({ text, id }));
            setOriginalSentence(sentence);
            setShuffledWords(shuffleArray(words));
        } catch (err) {
            console.error(err);
            setError('Cümle oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
            setGameState('idle');
        } finally {
            setIsLoading(false);
        }
    };
    
    // eslint-disable-next-line
    useEffect(() => { handleGetSentence(); }, [level]);

    const handleAvailableWordClick = (word: Word) => {
        if (gameState !== 'playing') return;
        setUserWords(prev => [...prev, word]);
    };
    
    const handleUserWordClick = (word: Word) => {
        if (gameState !== 'playing') return;
        setUserWords(prev => prev.filter(w => w.id !== word.id));
    };

    const handleCheck = () => {
        const userAnswer = userWords.map(w => w.text).join(' ');
        const correct = userAnswer === originalSentence;
        setIsCorrect(correct);
        setGameState('checked');
    };
    
    const handleTryAgain = () => {
        setUserWords([]);
        setIsCorrect(null);
        setGameState('playing');
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                        <label htmlFor="level-select" className="text-sm font-medium text-[rgb(var(--muted-foreground))]">Seviye</label>
                        <select 
                            id="level-select"
                            value={level} 
                            onChange={(e) => setLevel(e.target.value)} 
                            disabled={isLoading}
                            className="mt-1 p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none"
                        >
                            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <Button onClick={handleGetSentence} disabled={isLoading}>
                        {isLoading ? 'Yükleniyor...' : 'Yeni Cümle Getir'}
                    </Button>
                </div>
            </Card>

            {isLoading && <Loader />}
            {error && !isLoading && <p className="text-red-500 text-center">{error}</p>}

            {originalSentence && !isLoading && (
                <Card>
                    <div className="space-y-6">
                        <div className="min-h-[6rem] bg-[rgb(var(--muted))] p-3 rounded-lg border border-[rgb(var(--border))] flex flex-wrap items-center gap-2 transition-all">
                           {userWords.length > 0 ? (
                                userWords.map((word) => (
                                    <button 
                                      key={word.id} 
                                      onClick={() => handleUserWordClick(word)}
                                      disabled={gameState !== 'playing'}
                                      className="px-3 py-1.5 bg-[rgb(var(--card))] rounded-md shadow-sm text-[rgb(var(--card-foreground))] font-medium cursor-pointer hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:cursor-not-allowed"
                                      title="Kaldır"
                                    >
                                        {word.text}
                                    </button>
                                ))
                           ) : (
                                <span className="text-[rgb(var(--muted-foreground))] w-full text-center">Kelimeleri seçerek cümlenizi buraya kurun...</span>
                           )}
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 min-h-[4rem]">
                            {availableWords.map((word) => (
                                <Button
                                    key={word.id}
                                    variant="secondary"
                                    onClick={() => handleAvailableWordClick(word)}
                                    disabled={gameState !== 'playing'}
                                    className="text-base"
                                >
                                    {word.text}
                                </Button>
                            ))}
                        </div>

                        <div className="flex flex-wrap justify-center gap-4 pt-4 border-t border-[rgb(var(--border))]">
                            {gameState === 'playing' && (
                                <Button onClick={handleCheck} disabled={userWords.length < shuffledWords.length}>Kontrol Et</Button>
                            )}
                            {gameState === 'checked' && (
                                <>
                                    <Button onClick={handleTryAgain} variant="secondary">Tekrar Dene</Button>
                                    <Button onClick={handleGetSentence}>Sonraki Cümle</Button>
                                </>
                            )}
                        </div>

                        {gameState === 'checked' && isCorrect !== null && (
                            <div className={`p-4 rounded-lg flex items-center gap-3 ${isCorrect ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                                {isCorrect ? <CheckIcon className="w-6 h-6 text-green-600 flex-shrink-0" /> : <XMarkIcon className="w-6 h-6 text-red-600 flex-shrink-0" />}
                                <div>
                                    <p className={`font-semibold ${isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                        {isCorrect ? 'Harika! Doğru cevap.' : 'Doğru değil. Tekrar dene!'}
                                    </p>
                                    {!isCorrect && (
                                        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Doğru cümle: <span className="font-semibold">{originalSentence}</span></p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};
