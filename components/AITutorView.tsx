import React, { useState, useRef, useEffect, useCallback } from 'react';
// FIX: Import the SpeechRecognition type to resolve the "Cannot find name" error.
import type { Message, SpeechRecognition } from '../types';
import { getTutorResponse } from '../services/geminiService';
import { Button } from './common/Button';

const SpeakerWaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
);

const MicrophoneIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m12 0v-1.5a6 6 0 0 0-6-6v0a6 6 0 0 0-6 6v1.5m6 7.5v3.75m-3.75-3.75H8.25a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h7.5a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25-2.25h-1.5m-3.75-3.75a3.75 3.75 0 0 0-3.75-3.75v0a3.75 3.75 0 0 0-3.75 3.75v1.5a3.75 3.75 0 0 0 3.75 3.75v0a3.75 3.75 0 0 0 3.75-3.75v-1.5Zm9-3.75h-1.5" />
    </svg>
);

const SendIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

const UserIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
    </svg>
);

const RobotIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M4.5 3.75A.75.75 0 015.25 3h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 7.5A.75.75 0 015.25 6h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 11.25A.75.75 0 015.25 10.5h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 15A.75.75 0 015.25 13.5h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM4.5 18.75A.75.75 0 015.25 18h13.5a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);


const TypingIndicator: React.FC = () => (
    <div className="flex items-start gap-3 justify-start animate-fade-in-up">
        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[rgb(var(--muted))]">
            <RobotIcon className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
        </div>
        <div className="max-w-lg p-3 rounded-2xl rounded-bl-none shadow-md bg-[rgb(var(--muted))] text-[rgb(var(--foreground))]">
            <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-[rgb(var(--muted-foreground))] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-2 w-2 bg-[rgb(var(--muted-foreground))] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-2 w-2 bg-[rgb(var(--muted-foreground))] rounded-full animate-bounce"></span>
            </div>
        </div>
    </div>
);


const WelcomeMessage: React.FC<{ onPrompt: (prompt: string) => void }> = ({ onPrompt }) => (
    <div className="text-center my-auto flex flex-col items-center animate-fade-in-up">
         <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-br from-[rgb(var(--sky))] to-[rgb(var(--blue))] mb-6 shadow-lg shadow-[rgba(var(--primary),0.2)]">
            <span className="text-4xl">🧑‍🏫</span>
        </div>
        <h2 className="text-3xl font-bold">Merhaba! Ben AI Eğitmeniniz.</h2>
        <p className="text-[rgb(var(--muted-foreground))] mt-2 max-w-md">İngilizce öğrenimiyle ilgili her konuda size yardımcı olabilirim. Nasıl başlayabiliriz?</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button variant="secondary" onClick={() => onPrompt("Present Perfect Tense'i açıklar mısın?")}>"Present Perfect Tense'i açıklar mısın?"</Button>
            <Button variant="secondary" onClick={() => onPrompt("İngilizce'de 'get' fiilinin kullanımları nelerdir?")}>"'get' fiilinin kullanımları nelerdir?"</Button>
            <Button variant="secondary" onClick={() => onPrompt("Bir iş mülakatı için pratik yapalım.")}>"Bir iş mülakatı için pratik yapalım"</Button>
        </div>
    </div>
);

export const AITutorView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<'Turkish' | 'English'>('Turkish');
  const [isListening, setIsListening] = useState(false);
  const [recognitionAvailable, setRecognitionAvailable] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setRecognitionAvailable(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim();
        setInput(prev => prev ? `${prev} ${transcript}` : transcript);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    return () => {
        recognitionRef.current?.stop();
        window.speechSynthesis.cancel();
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent | null, prompt?: string) => {
    if(e) e.preventDefault();
    const currentInput = prompt || input;
    if (!currentInput.trim() || isLoading) return;
    if(isListening) {
      recognitionRef.current?.stop();
    }
    window.speechSynthesis.cancel();
    setSpeakingIndex(null);

    const userMessage: Message = { role: 'user', text: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));
      const responseText = await getTutorResponse(history, currentInput, language);
      const modelMessage: Message = { role: 'model', text: responseText };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error fetching tutor response:", error);
      const errorMessage: Message = { role: 'model', text: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin." };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleWelcomePrompt = (prompt: string) => {
    handleSendMessage(null, prompt);
  };
  
  const toggleListening = () => {
      if (isListening) {
          recognitionRef.current?.stop();
      } else {
          recognitionRef.current?.start();
      }
      setIsListening(!isListening);
  };

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

  return (
    <div className="flex flex-col h-full bg-[rgb(var(--card))] rounded-xl shadow-lg border border-[rgb(var(--border))]">
      <div className="flex-shrink-0 flex justify-end p-4 border-b border-[rgb(var(--border))]">
        <div className="flex items-center space-x-2 bg-[rgb(var(--muted))] p-1 rounded-lg">
          <button onClick={() => setLanguage('Turkish')} className={`text-sm px-3 py-1 rounded-md transition-colors ${language === 'Turkish' ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] shadow' : 'hover:bg-[rgba(var(--foreground),0.05)]'}`}>Türkçe</button>
          <button onClick={() => setLanguage('English')} className={`text-sm px-3 py-1 rounded-md transition-colors ${language === 'English' ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] shadow' : 'hover:bg-[rgba(var(--foreground),0.05)]'}`}>English</button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.length === 0 && !isLoading && <WelcomeMessage onPrompt={handleWelcomePrompt} />}

        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 animate-fade-in-up ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'model' && (
                <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-[rgb(var(--muted))]">
                    <RobotIcon className="w-6 h-6 text-[rgb(var(--muted-foreground))]"/>
                </div>
            )}
            <div className={`flex items-end gap-2 max-w-lg ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`p-3 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-gradient-to-br from-[rgb(var(--sky))] to-[rgb(var(--blue))] text-white rounded-br-none' : 'bg-[rgb(var(--muted))] text-[rgb(var(--card-foreground))] rounded-bl-none'}`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                 {msg.role === 'model' && (
                    <button onClick={() => playAudio(msg.text, index)} className={`p-1 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] transition-colors self-center ${speakingIndex === index ? 'animate-pulse' : ''}`}>
                        <SpeakerWaveIcon className="w-5 h-5"/>
                    </button>
                )}
            </div>
             {msg.role === 'user' && (
                 <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-500">
                    <UserIcon className="w-6 h-6 text-white"/>
                </div>
            )}
          </div>
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={chatEndRef} />
      </div>
      <div className="flex-shrink-0 p-4 border-t border-[rgb(var(--border))]">
        <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2 bg-[rgb(var(--muted))] rounded-xl p-2 shadow-inner">
            <div className="relative flex-1">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Sorunuzu yazın veya mikrofona dokunun..."
                  className="w-full p-2 bg-transparent focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                  disabled={isLoading}
                />
            </div>
             {recognitionAvailable && (
                <button type="button" onClick={toggleListening} className="p-2 rounded-full hover:bg-[rgba(var(--foreground),0.05)] transition-colors">
                    <MicrophoneIcon className={`w-6 h-6 ${isListening ? 'text-red-500 animate-pulse' : 'text-[rgb(var(--muted-foreground))]'}`} />
                </button>
            )}
            <Button type="submit" disabled={isLoading || !input.trim()} className="!rounded-lg w-10 h-10 !p-0">
                <SendIcon className="w-5 h-5"/>
            </Button>
        </form>
      </div>
    </div>
  );
};