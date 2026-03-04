import React, { useState } from 'react';
import { WORDS_OF_THE_DAY } from '../services/wordOfTheDayData';
import { AFFIXES_OF_THE_DAY } from '../services/affixOfTheDayData';
import { Card } from './common/Card';
import type { Tool } from '../types';
import { TOOL_CATEGORIES } from '../constants';
import { useMotivation } from '../hooks/useMotivation';
import { useProgress } from '../hooks/useProgress';
import { DateTimeWidget } from './DateTimeWidget';
import { WeatherWidget } from './WeatherWidget';
import { useQuickActions } from '../hooks/useQuickActions';
import { QuickActionsModal } from './QuickActionsModal';
import { Button } from './common/Button';

interface HomeViewProps {
  onSelectTool: (tool: Tool) => void;
}

const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 19.5a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
);


const QuickActionCard: React.FC<{ tool: Tool; onSelect: () => void }> = ({ tool, onSelect }) => (
    <Card variant="interactive" className="text-center flex flex-col items-center justify-start p-4" onClick={onSelect}>
        <div className="text-4xl mb-3">{tool.icon}</div>
        <h3 className="font-semibold text-[rgb(var(--card-foreground))]">{tool.name}</h3>
        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1 flex-1">{tool.description}</p>
    </Card>
);

const ProgressSnapshot: React.FC = () => {
    const { motivationData } = useMotivation();
    const { progressData } = useProgress();
    
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${String(hours)}s ${String(minutes).padStart(2, '0')}d`;
    };

    return (
        <Card>
            <h3 className="text-lg font-semibold mb-4">İlerleme Anlık Görüntüsü</h3>
            <div className="flex justify-around text-center">
                <div>
                    <p className="text-3xl font-bold text-[rgb(var(--primary))]">{motivationData.currentStreak}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">Günlük Seri</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-[rgb(var(--primary))]">{progressData.speakingSessions}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">Konuşma Pratiği</p>
                </div>
                <div>
                    <p className="text-3xl font-bold text-[rgb(var(--primary))]">{formatTime(progressData.totalPracticeTime)}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">Toplam Süre</p>
                </div>
            </div>
        </Card>
    );
};

export const HomeView: React.FC<HomeViewProps> = ({ onSelectTool }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { quickActionIds, saveQuickActions } = useQuickActions();
    
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const wordOfTheDay = WORDS_OF_THE_DAY[dayOfYear % WORDS_OF_THE_DAY.length];
    const affixOfTheDay = AFFIXES_OF_THE_DAY[dayOfYear % AFFIXES_OF_THE_DAY.length];

    const allTools = TOOL_CATEGORIES.flatMap(cat => cat.tools);
    const quickActionTools = quickActionIds.map(id => allTools.find(tool => tool.id === id)).filter(Boolean) as Tool[];
    
    return (
        <>
            <QuickActionsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                currentActions={quickActionIds}
                onSave={saveQuickActions}
            />
            <div className="space-y-8 animate-fade-in-up">
                <header className="p-8 rounded-xl bg-gradient-to-br from-[rgba(var(--primary),0.1)] to-[rgba(var(--violet),0.1)]">
                    <h1 className="text-4xl font-bold tracking-tight text-[rgb(var(--foreground))]">
                        Hoşgeldin!
                    </h1>
                    <p className="text-xl text-[rgb(var(--muted-foreground))] mt-2">
                        Bugün İngilizce yolculuğunda ne yapmak istersin?
                    </p>
                </header>
                
                <section>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Hızlı Eylemler</h2>
                        <Button variant="secondary" onClick={() => setIsModalOpen(true)}>
                            <EditIcon className="w-4 h-4" />
                            <span>Düzenle</span>
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {quickActionTools.map(tool => (
                            <QuickActionCard key={tool.id} tool={tool} onSelect={() => onSelectTool(tool)} />
                        ))}
                    </div>
                </section>

                <ProgressSnapshot />
                
                <section>
                    <h2 className="text-2xl font-bold mb-4">Günün Bilgileri</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <DateTimeWidget />
                        <WeatherWidget />
                        <Card variant="interactive" className="flex flex-col">
                            <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-4">🗣️ Her Güne Bir Kelime</h2>
                            <div className="mb-4">
                                <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-blue-600">{wordOfTheDay.word}</p>
                                <p className="text-lg text-[rgb(var(--muted-foreground))] italic">{wordOfTheDay.meaning}</p>
                            </div>
                            <div className="space-y-3 border-t border-[rgb(var(--border))] pt-4 flex-1">
                                {wordOfTheDay.examples.map((example, index) => (
                                    <div key={index}>
                                        <p className="text-[rgb(var(--foreground))]">"{example.english}"</p>
                                        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">{example.turkish}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        
                        <Card variant="interactive" className="flex flex-col">
                            <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-4">🧩 Günün Eki</h2>
                            <div className="mb-4">
                                <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-600">{affixOfTheDay.affix}</p>
                                <p className="text-lg text-[rgb(var(--muted-foreground))] italic">Türü: {affixOfTheDay.type}, Anlamı: {affixOfTheDay.meaning}</p>
                            </div>
                            <div className="space-y-3 border-t border-[rgb(var(--border))] pt-4 flex-1">
                                {affixOfTheDay.examples.map((example, index) => (
                                    <div key={index}>
                                        <p className="font-semibold text-[rgb(var(--foreground))]">{example.word}</p>
                                        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">{example.definition}</p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </section>
            </div>
        </>
    );
};