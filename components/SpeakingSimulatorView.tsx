import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Import the SpeechRecognition type to resolve the "Cannot find name" error.
import type { Message, SpeechRecognition } from '../types';
import { getSpeakingScenarioResponse, generateSpeakingGoals, evaluateSpeakingPerformance } from '../services/geminiService';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { Card } from './common/Card';
import { useProgress } from '../hooks/useProgress';

const SCENARIOS: Record<string, string[]> = {
  easy: [
    "Ordering a coffee",
    "Introducing yourself to a new colleague",
    "Buying a train ticket",
    "Asking for the time",
    "Greeting a friend"
  ],
  medium: [
    "Ordering food at a restaurant",
    "Checking in at an airport",
    "Asking for directions in a new city",
    "Making small talk at a party",
    "Returning a faulty item to a store"
  ],
  hard: [
    "A job interview for a software developer role",
    "Debating a topic with a friend",
    "Negotiating a salary",
    "Explaining a complex problem to a technician",
    "Persuading a friend to try something new"
  ]
};

const SpeakerWaveIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /> </svg> );
const MicrophoneIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-6-6v0a6 6 0 0 0-6 6v1.5m6 7.5v3.75m-3.75-3.75H8.25a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h7.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25-2.25h-1.5m-3.75-3.75a3.75 3.75 0 0 0-3.75-3.75v0a3.75 3.75 0 0 0-3.75 3.75v1.5a3.75 3.75 0 0 0 3.75 3.75v0a3.75 3.75 0 0 0 3.75-3.75v-1.5Zm9-3.75h-1.5" /> </svg> );

export const SpeakingSimulatorView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [evaluation, setEvaluation] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionAvailable, setRecognitionAvailable] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const lastPlayedMessageRef = useRef<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { logSpeakingSession } = useProgress();

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, evaluation]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionAvailable(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true; recognition.lang = 'en-US'; recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => { 
        recognitionRef.current?.stop();
        window.speechSynthesis.cancel();
    }
  }, []);

  const playAudio = useCallback((text: string, index: number) => {
    if (speakingIndex === index) {
        window.speechSynthesis.cancel();
        setSpeakingIndex(null);
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.onstart = () => setSpeakingIndex(index);
    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = (e) => {
        console.error("SpeechSynthesis Error", e);
        setSpeakingIndex(null);
    };
    window.speechSynthesis.speak(utterance);
  }, [speakingIndex]);
  
  useEffect(() => {
    if (mode === 'voice' && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === 'model' && lastMessage.text !== lastPlayedMessageRef.current) {
            playAudio(lastMessage.text, messages.length - 1);
            lastPlayedMessageRef.current = lastMessage.text;
        }
    }
  }, [messages, mode, playAudio]);

  const resetState = () => {
      setMessages([]); setInput(''); setIsLoading(false); setSelectedScenario(null);
      setGoals([]); setIsFinished(false); setEvaluation(null); setIsListening(false);
      window.speechSynthesis.cancel();
  };

  const startScenario = async (scenario: string) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setIsLoading(true);
    try {
      const [goalsResponse, initialMessage] = await Promise.all([
          generateSpeakingGoals(scenario),
          getSpeakingScenarioResponse([], "", scenario)
      ]);
      setGoals(goalsResponse);
      const modelMessage: Message = { role: 'model', text: initialMessage };
      setMessages([modelMessage]);
    } catch (error) {
      console.error("Error starting scenario:", error);
      setMessages([{ role: 'model', text: "Sorry, I couldn't start the scenario. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !selectedScenario) return;
    if(isListening) recognitionRef.current?.stop();
    window.speechSynthesis.cancel();

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({ role: msg.role, parts: [{ text: msg.text }] }));
      const responseText = await getSpeakingScenarioResponse(history, input, selectedScenario);
      const modelMessage: Message = { role: 'model', text: responseText };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error fetching scenario response:", error);
      setMessages((prev) => [...prev, { role: 'model', text: "Sorry, an error occurred. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = async () => {
      setIsLoading(true);
      setIsFinished(true);
      window.speechSynthesis.cancel();
      try {
          const evalText = await evaluateSpeakingPerformance(messages, selectedScenario!, goals);
          setEvaluation(evalText);
          logSpeakingSession();
      } catch (error) {
          console.error("Error evaluating performance:", error);
          setEvaluation("Değerlendirme alınırken bir hata oluştu.");
      } finally {
          setIsLoading(false);
      }
  };

  const toggleListening = () => { if (isListening) { recognitionRef.current?.stop(); } else { recognitionRef.current?.start(); } setIsListening(!isListening); };

  if (!selectedScenario) {
    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4">Bir Senaryo Seçin</h3>
            <div className="space-y-6">
                {Object.entries(SCENARIOS).map(([difficulty, scenarios]) => (
                    <div key={difficulty}>
                        <h4 className="text-lg font-semibold capitalize mb-2 text-[rgb(var(--foreground))] border-b border-[rgb(var(--border))] pb-1">{difficulty}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            {scenarios.map(scenario => (
                                <Button key={scenario} variant="secondary" onClick={() => startScenario(scenario)}>
                                    {scenario}
                                </Button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <Card className="flex-shrink-0">
        <h3 className="text-lg font-medium text-[rgb(var(--foreground))]">{selectedScenario}</h3>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">Hedefleriniz:</p>
        <ul className="list-disc list-inside text-sm text-[rgb(var(--muted-foreground))]">
            {goals.length > 0 ? goals.map((g, i) => <li key={i}>{g}</li>) : <li>Yükleniyor...</li>}
        </ul>
      </Card>
      
      {isFinished ? (
        <Card className="flex-1 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-2">Değerlendirme</h3>
            {isLoading ? <Loader /> : <p className="whitespace-pre-wrap text-[rgb(var(--foreground))]">{evaluation}</p>}
            <Button onClick={resetState} className="mt-4">Yeni Senaryo Seç</Button>
        </Card>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
            <div className="flex-1 min-h-0 overflow-y-auto p-4 border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] space-y-4">
                {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {mode === 'text' && msg.role === 'model' && (<button onClick={() => playAudio(msg.text, index)} className="p-1 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] disabled:opacity-50">{speakingIndex === index ? <div className="w-5 h-5 border-2 border-[rgb(var(--muted-foreground))] border-t-transparent rounded-full animate-spin"></div> : <SpeakerWaveIcon className="w-5 h-5"/>}</button>)}
                    <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))]' : 'bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]'}`}>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                </div>
                ))}
                {isLoading && (<div className="flex justify-start"><div className="max-w-lg p-3 rounded-lg bg-[rgb(var(--muted))]"><Loader text="AI düşünüyor..." /></div></div>)}
                <div ref={chatEndRef} />
            </div>

            <div className="flex-shrink-0">
                <div className="flex justify-end mb-2">
                    <div className="flex items-center space-x-2">
                        <Button variant={mode === 'text' ? 'primary' : 'secondary'} onClick={() => setMode('text')} className="text-sm px-3 py-1">Yazılı</Button>
                        <Button variant={mode === 'voice' ? 'primary' : 'secondary'} onClick={() => setMode('voice')} className="text-sm px-3 py-1">Sesli</Button>
                    </div>
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            placeholder={mode === 'voice' ? "Konuşmak için mikrofona dokunun..." : "Cevabınızı yazın veya mikrofona dokunun..."}
                            className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none pr-10 placeholder:text-[rgb(var(--muted-foreground))]" 
                            disabled={isLoading}
                            readOnly={mode === 'voice'}
                        />
                        {recognitionAvailable && (<button type="button" onClick={toggleListening} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[rgb(var(--muted))]"><MicrophoneIcon className={`w-6 h-6 ${isListening ? 'text-red-500' : 'text-[rgb(var(--muted-foreground))]'}`} /></button>)}
                    </div>
                    <Button type="submit" disabled={isLoading || !input.trim()}>Gönder</Button>
                </form>
                <div className="mt-4 flex flex-col sm:flex-row justify-between gap-2">
                    <Button variant="secondary" onClick={resetState}>Senaryo Değiştir</Button>
                    <Button variant="secondary" onClick={handleFinish} disabled={isLoading || messages.length < 2}>Konuşmayı Bitir</Button>
                </div>
            </div>
        </div>
        )}
      </div>
  );
};