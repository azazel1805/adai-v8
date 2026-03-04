import React, { useState, useEffect, useRef } from 'react';
import { generateEssayTopics, generateEssayOutline, writeFullEssay } from '../services/geminiService';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { Card } from './common/Card';
import { useNotebook } from '../hooks/useNotebook';
import { useProgress } from '../hooks/useProgress';

type Action = 'topics' | 'outline' | 'full';
const ESSAY_TYPES = ['Argumentative', 'Expository', 'Narrative', 'Descriptive', 'Persuasive'];

export const EssayHelperView: React.FC = () => {
  const [action, setAction] = useState<Action>('topics');
  const [essayType, setEssayType] = useState(ESSAY_TYPES[0]);
  const [input, setInput] = useState('');
  const [outline, setOutline] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timeAtUnmount = useRef(0);

  const { addEssay } = useNotebook();
  const { addPracticeTime, logEssayWritten } = useProgress();

  useEffect(() => {
    timeAtUnmount.current = time;
  }, [time]);

  useEffect(() => {
    return () => {
      if (timeAtUnmount.current > 0) {
        addPracticeTime(timeAtUnmount.current);
      }
    };
  }, [addPracticeTime]);

  useEffect(() => {
    let intervalId: number | undefined;

    if (isActive) {
      intervalId = window.setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isActive]);

  const handleToggleTimer = () => {
    setIsActive(!isActive);
  };

  const handleResetTimer = () => {
    if (time > 0) {
        addPracticeTime(time);
    }
    setTime(0);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleGenerate = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setResult('');
    setIsSaved(false);
    try {
      let response = '';
      if (action === 'topics') {
        response = await generateEssayTopics(input, essayType);
      } else if (action === 'outline') {
        response = await generateEssayOutline(input, essayType);
        setOutline(response);
      } else if (action === 'full') {
        response = await writeFullEssay(input, essayType, outline);
      }
      setResult(response);
    } catch (error) {
      console.error("Error in essay helper:", error);
      setResult("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEssay = () => {
    if (result && action === 'full') {
      addEssay({ id: input, topic: input, content: result });
      logEssayWritten();
      setIsSaved(true);
    }
  };

  const getPlaceholder = () => {
    switch (action) {
      case 'topics': return "Örn: Technology, Environment...";
      case 'outline': return "Essay konusunu buraya yazın...";
      case 'full': return "Essay konusunu buraya yazın...";
    }
  };

  return (
    <div className="space-y-6">
       <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h3 className="text-lg font-semibold">Yazma Zamanlayıcısı</h3>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-mono tabular-nums bg-[rgb(var(--muted))] px-3 py-1 rounded-md">{formatTime(time)}</span>
            <div className="flex gap-2">
              <Button onClick={handleToggleTimer} variant="secondary">
                {isActive ? 'Duraklat' : 'Başlat'}
              </Button>
              <Button onClick={handleResetTimer} variant="secondary">
                Sıfırla
              </Button>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <div className="flex flex-wrap gap-2 border-b border-[rgb(var(--border))] pb-4 mb-4">
          <Button variant={action === 'topics' ? 'primary' : 'secondary'} onClick={() => setAction('topics')}>Konu Bul</Button>
          <Button variant={action === 'outline' ? 'primary' : 'secondary'} onClick={() => setAction('outline')}>Taslak Oluştur</Button>
          <Button variant={action === 'full' ? 'primary' : 'secondary'} onClick={() => setAction('full')}>Tam Essay Yaz</Button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="essayType" className="block text-sm font-medium text-[rgb(var(--muted-foreground))] mb-1">Essay Türü</label>
            <select
                id="essayType"
                value={essayType}
                onChange={(e) => setEssayType(e.target.value)}
                className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none"
                disabled={isLoading}
            >
                {ESSAY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md h-24 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
              disabled={isLoading}
            />
            <p className="text-right text-sm text-[rgb(var(--muted-foreground))]">{input.length} karakter</p>
          </div>
          {action === 'full' && (
             <div>
                <textarea
                  value={outline}
                  onChange={(e) => setOutline(e.target.value)}
                  placeholder="İsteğe bağlı: Taslağı buraya yapıştırın..."
                  className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-md h-32 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                  disabled={isLoading}
                />
                <p className="text-right text-sm text-[rgb(var(--muted-foreground))]">{outline.length} karakter</p>
             </div>
          )}
          <Button onClick={handleGenerate} disabled={isLoading || !input.trim()}>
            {isLoading ? 'Oluşturuluyor...' : 'Oluştur'}
          </Button>
        </div>
      </Card>
      
      {(isLoading || result) && (
        <Card>
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold">Sonuç</h3>
                {action === 'full' && result && !isLoading && (
                    <Button onClick={handleSaveEssay} disabled={isSaved} variant="secondary">
                        {isSaved ? 'Kaydedildi' : 'Essay\'i Kaydet'}
                    </Button>
                )}
            </div>
          {isLoading ? <Loader /> : (
            <div className="prose dark:prose-invert max-w-none text-[rgb(var(--foreground))] whitespace-pre-wrap">{result}</div>
          )}
        </Card>
      )}
    </div>
  );
};