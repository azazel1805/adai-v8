import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from './common/Card';

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M12 12.75h.008v.008H12v-.008Z" />
    </svg>
);


export const DateTimeWidget: React.FC = () => {
    const [date, setDate] = useState(new Date());
    const [isSpeaking, setIsSpeaking] = useState(false);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        const timerId = setInterval(() => setDate(new Date()), 1000);

        const loadVoices = () => {
            voicesRef.current = window.speechSynthesis.getVoices();
        };
        
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
        
        return () => {
            clearInterval(timerId);
            window.speechSynthesis.onvoiceschanged = null;
            window.speechSynthesis.cancel();
        };
    }, []);

    const formatDate = (d: Date) => {
        return d.toLocaleDateString('tr-TR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (d: Date) => {
        return d.toLocaleTimeString('tr-TR');
    };
    
    const handleReadAloud = useCallback(() => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const formatDateForSpeech = (d: Date) => {
            return d.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        };

        const formatTimeForSpeech = (d: Date) => {
            return d.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            });
        };

        const textToSpeak = `The current date is ${formatDateForSpeech(date)}, and the time is ${formatTimeForSpeech(date)}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        
        const englishVoice = voicesRef.current.find(voice => voice.lang.startsWith('en-'));
        if (englishVoice) {
            utterance.voice = englishVoice;
        }
        utterance.lang = 'en-US';

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.error("SpeechSynthesisUtterance.onerror", e);
            setIsSpeaking(false);
        };

        window.speechSynthesis.speak(utterance);
    }, [isSpeaking, date]);

    return (
        <Card variant="interactive" onClick={handleReadAloud} className="flex flex-col justify-center">
            <div className="flex items-center gap-4">
                <CalendarIcon className={`w-10 h-10 text-[rgb(var(--muted-foreground))] transition-colors ${isSpeaking ? 'text-[rgb(var(--primary))]' : ''}`} />
                <div>
                    <p className="font-semibold text-lg text-[rgb(var(--foreground))]">{formatDate(date)}</p>
                    <p className="text-3xl font-bold text-[rgb(var(--primary))]">{formatTime(date)}</p>
                </div>
            </div>
        </Card>
    );
};