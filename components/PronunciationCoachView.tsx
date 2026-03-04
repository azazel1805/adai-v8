import React, { useState, useRef, useEffect } from 'react';
// FIX: Import the SpeechRecognition type to resolve the "Cannot find name" error.
import type { PronunciationFeedback, SpeechRecognition } from '../types';
import { getPronunciationFeedback } from '../services/geminiService';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { useProgress } from '../hooks/useProgress';

// Icons
const SpeakerWaveIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /> </svg> );
const MicrophoneIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-6-6v0a6 6 0 0 0-6 6v1.5m6 7.5v3.75m-3.75-3.75H8.25a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h7.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25-2.25h-1.5m-3.75-3.75a3.75 3.75 0 0 0-3.75-3.75v0a3.75 3.75 0 0 0-3.75 3.75v1.5a3.75 3.75 0 0 0 3.75 3.75v0a3.75 3.75 0 0 0 3.75-3.75v-1.5Zm9-3.75h-1.5" /> </svg> );
const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" /> </svg> );
const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> </svg> );

export const PronunciationCoachView: React.FC = () => {
    const [text, setText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [transcribedText, setTranscribedText] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<PronunciationFeedback | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const { logPronunciationSession } = useProgress();

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.trim();
                setTranscribedText(transcript);
            };

            recognition.onend = () => {
                setIsListening(false);
            };
            
            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                setError('Mikrofon hatası. Lütfen izinleri kontrol edin.');
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        } else {
            setError('Tarayıcınız ses tanımayı desteklemiyor.');
        }

        return () => {
            recognitionRef.current?.stop();
            window.speechSynthesis.cancel();
        };
    }, []);

    const handleListen = () => {
        if (!text.trim() || !('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            setTranscribedText(null);
            setFeedback(null);
            setError(null);
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };
    
    const handleAnalyze = async () => {
        if (!text.trim() || !transcribedText) return;
        
        setIsLoading(true);
        setFeedback(null);
        setError(null);
        
        try {
            const result = await getPronunciationFeedback(text, transcribedText);
            setFeedback(result);
            logPronunciationSession();
        } catch (err) {
            console.error(err);
            setError('Geri bildirim alınırken bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="text-input" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                            1. Pratik yapmak istediğiniz metni girin
                        </label>
                        <div className="flex gap-2">
                            <input
                                id="text-input"
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="e.g., The quick brown fox jumps over the lazy dog."
                                className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                            />
                            <Button variant="secondary" onClick={handleListen} disabled={!text.trim()} aria-label="Listen to text">
                                <SpeakerWaveIcon className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    <div>
                        <p className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                            2. Metni sesli okumak için kayıt yapın
                        </p>
                        <Button onClick={toggleListening} disabled={!text.trim()} className="w-full">
                            <MicrophoneIcon className={`w-5 h-5 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
                            {isListening ? 'Kaydediliyor...' : 'Kaydı Başlat'}
                        </Button>
                    </div>

                    {transcribedText && (
                         <div>
                             <p className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                                Sizin telaffuzunuz (Metne çevrildi)
                            </p>
                            <p className="p-2 bg-[rgb(var(--muted))] rounded-md italic">"{transcribedText}"</p>
                         </div>
                    )}
                    
                    <div>
                         <p className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">
                            3. Geri bildirim alın
                        </p>
                        <Button onClick={handleAnalyze} disabled={!transcribedText || isLoading} className="w-full">
                           {isLoading ? "Analiz ediliyor..." : "Analiz Et"}
                        </Button>
                    </div>
                </div>
            </Card>

            {isLoading && <Loader />}
            {error && <p className="text-red-500 text-center">{error}</p>}
            
            {feedback && (
                <Card>
                    <h3 className="text-xl font-semibold mb-4">Geri Bildirim</h3>
                    
                    {feedback.mistakes.length === 0 ? (
                        <div className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-900/50 rounded-lg text-green-800 dark:text-green-200">
                             <CheckCircleIcon className="w-8 h-8"/>
                             <p className="font-semibold">{feedback.overallFeedback}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="p-3 bg-[rgb(var(--muted))] rounded-md">{feedback.overallFeedback}</p>
                            {feedback.mistakes.map((mistake, index) => (
                                <div key={index} className="p-4 border border-[rgb(var(--border))] rounded-lg">
                                    <div className="flex items-center gap-2 text-md mb-2 font-mono">
                                        <span className="text-red-600 dark:text-red-400 line-through">{mistake.mispronouncedWord}</span>
                                        <ArrowRightIcon className="w-5 h-5 text-[rgb(var(--muted-foreground))] flex-shrink-0" />
                                        <span className="text-green-700 dark:text-green-400 font-semibold">{mistake.intendedWord}</span>
                                    </div>
                                    <p className="text-[rgb(var(--muted-foreground))]">{mistake.feedback}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}

        </div>
    );
};