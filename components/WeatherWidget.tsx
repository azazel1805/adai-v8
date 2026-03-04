import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from './common/Card';
import { Loader } from './common/Loader';
import type { WeatherInfo } from '../types';
import { getWeatherInfo } from '../services/geminiService';

const LocationMarkerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
);

export const WeatherWidget: React.FC = () => {
    const [weather, setWeather] = useState<WeatherInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError('Tarayıcınız konum servisini desteklemiyor.');
            setIsLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const weatherData = await getWeatherInfo(latitude, longitude);
                    setWeather(weatherData);
                } catch (apiError) {
                    console.error("Error fetching weather data:", apiError);
                    setError('Hava durumu bilgisi alınamadı.');
                } finally {
                    setIsLoading(false);
                }
            },
            (geoError) => {
                console.error("Geolocation error:", geoError);
                setError('Konum bilgisine erişilemedi. Lütfen izinleri kontrol edin.');
                setIsLoading(false);
            }
        );

        const loadVoices = () => {
            voicesRef.current = window.speechSynthesis.getVoices();
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
            window.speechSynthesis.cancel();
        };
    }, []);
    
    const handleReadAloud = useCallback(() => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }
        if (!weather) return;

        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
        }

        const textToSpeak = `In ${weather.city}, the weather is ${weather.englishDescription} with a temperature of ${Math.round(weather.temperature)} degrees Celsius.`;
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
    }, [isSpeaking, weather]);

    return (
        <Card variant="interactive" onClick={handleReadAloud} className="flex flex-col justify-center">
            {isLoading && <Loader text="Hava durumu yükleniyor..." />}
            {error && !isLoading && (
                 <div className="flex items-center gap-4 text-[rgb(var(--muted-foreground))]">
                    <LocationMarkerIcon className="w-10 h-10"/>
                    <div>
                        <p className="font-semibold text-lg text-[rgb(var(--foreground))]">Hava Durumu</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}
            {weather && !isLoading && !error &&(
                <div className="flex items-center gap-4">
                    <span className={`text-5xl transition-transform duration-300 ${isSpeaking ? 'scale-110' : ''}`}>{weather.icon}</span>
                    <div>
                        <p className="font-semibold text-lg text-[rgb(var(--foreground))]">{weather.city}</p>
                        <p className="text-3xl font-bold text-[rgb(var(--primary))]">{Math.round(weather.temperature)}°C</p>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">{weather.description}</p>
                    </div>
                </div>
            )}
        </Card>
    );
};