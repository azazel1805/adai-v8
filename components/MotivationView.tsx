import React, { useState, useEffect } from 'react';
import { useMotivation } from '../hooks/useMotivation';
import { useProgress } from '../hooks/useProgress';
import { useNotebook } from '../hooks/useNotebook';
import { generateWeeklyLearningPlan } from '../services/geminiService';
import { ALL_ACHIEVEMENTS, checkNewlyUnlockedAchievements } from '../services/achievements';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import type { WeeklyTask, LearningPlan } from '../types';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const GOALS = ['Genel İngilizcemi Geliştirmek', 'Sınavlara Hazırlanmak (TOEFL, IELTS)', 'İş İngilizcesi Öğrenmek', 'Seyahat İçin İngilizce', 'Akademik İngilizce'];

const LearningPlanSetup: React.FC<{ onSave: (level: string, goal: string) => void }> = ({ onSave }) => {
    const [level, setLevel] = useState(LEVELS[2]);
    const [goal, setGoal] = useState(GOALS[0]);

    const handleSave = () => {
        onSave(level, goal);
    };

    return (
        <Card>
            <h3 className="text-xl font-semibold mb-2">Başlamadan Önce</h3>
            <p className="text-[rgb(var(--muted-foreground))] mb-4">Size özel bir öğrenme planı oluşturabilmemiz için seviyenizi ve hedefinizi belirtin.</p>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">İngilizce Seviyeniz</label>
                    <select value={level} onChange={e => setLevel(e.target.value)} className="w-full p-2 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-md">
                        {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Öğrenme Hedefiniz</label>
                    <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full p-2 bg-[rgb(var(--card))] border border-[rgb(var(--border))] rounded-md">
                        {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                <Button onClick={handleSave}>Kaydet ve Devam Et</Button>
            </div>
        </Card>
    );
};

const LearningPlanDisplay: React.FC<{
    level: string;
    goal: string;
    plan: LearningPlan | null;
    onGenerate: () => void;
    onToggleTask: (index: number) => void;
    isLoading: boolean;
}> = ({ level, goal, plan, onGenerate, onToggleTask, isLoading }) => {
    
    const isPlanOutdated = () => {
        if (!plan) return true;
        const today = new Date();
        const planDate = new Date(plan.generatedDate);
        const diffDays = (today.getTime() - planDate.getTime()) / (1000 * 3600 * 24);
        return diffDays >= 7;
    };

    return (
        <Card>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-semibold">Haftalık Öğrenme Planınız</h3>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">Seviye: {level}, Hedef: {goal}</p>
                </div>
                <Button variant="secondary" onClick={onGenerate} disabled={isLoading}>
                    {isLoading ? "Oluşturuluyor..." : "Yeni Plan Oluştur"}
                </Button>
            </div>
            
            {isLoading && <Loader text="Size özel plan oluşturuluyor..." />}

            {!isLoading && plan && (
                 <div className="space-y-3">
                    {isPlanOutdated() && <p className="text-amber-600 text-sm">Bu plan bir haftadan eski. Yeni bir plan oluşturabilirsiniz.</p>}
                    {plan.tasks.map((task, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-[rgb(var(--muted))] rounded-md">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => onToggleTask(index)}
                                className="h-5 w-5 rounded border-gray-300 text-[rgb(var(--primary))] focus:ring-[rgb(var(--primary))]"
                            />
                            <label className={`flex-1 ${task.completed ? 'line-through text-[rgb(var(--muted-foreground))]' : ''}`}>
                                {task.task}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

const AchievementsGrid: React.FC<{ unlockedIds: Set<string> }> = ({ unlockedIds }) => {
    return (
        <Card>
            <h3 className="text-xl font-semibold mb-4">Başarımlar</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {ALL_ACHIEVEMENTS.map(ach => {
                    const isUnlocked = unlockedIds.has(ach.id);
                    if (ach.isSecret && !isUnlocked) {
                        return (
                             <div key={ach.id} className="flex flex-col items-center text-center p-3 border border-dashed border-[rgb(var(--border))] rounded-lg">
                                <span className="text-4xl">🤫</span>
                                <p className="font-bold mt-2">Gizli Başarım</p>
                            </div>
                        )
                    }
                    return (
                        <div key={ach.id} className={`flex flex-col items-center text-center p-3 border rounded-lg ${isUnlocked ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'border-[rgb(var(--border))] bg-[rgb(var(--card))]'}`}>
                            <span className={`text-4xl transition-transform duration-300 ${isUnlocked ? 'grayscale-0 scale-110' : 'grayscale'}`}>{ach.icon}</span>
                            <p className={`font-bold mt-2 ${isUnlocked ? 'text-amber-700 dark:text-amber-200' : 'text-[rgb(var(--foreground))]'}`}>{ach.name}</p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">{ach.description}</p>
                        </div>
                    )
                })}
            </div>
        </Card>
    );
};

export const MotivationView: React.FC = () => {
    const { motivationData, unlockAchievement, savePreferences, saveWeeklyPlan, toggleTaskCompletion } = useMotivation();
    const { progressData } = useProgress();
    const { notebookData } = useNotebook();
    const [isPlanLoading, setIsPlanLoading] = useState(false);

    useEffect(() => {
        const newlyUnlocked = checkNewlyUnlockedAchievements(progressData, notebookData, motivationData);
        if (newlyUnlocked.length > 0) {
            newlyUnlocked.forEach(id => unlockAchievement(id));
            // Optionally, show a notification here
        }
    }, [progressData, notebookData, motivationData, unlockAchievement]);

    const handleSavePreferences = (level: string, goal: string) => {
        savePreferences(level, goal);
    };

    const handleGeneratePlan = async () => {
        if (!motivationData.userLevel || !motivationData.userGoal) return;
        setIsPlanLoading(true);
        try {
            const tasks = await generateWeeklyLearningPlan(motivationData.userLevel, motivationData.userGoal);
            const newPlan: LearningPlan = {
                generatedDate: new Date().toISOString().split('T')[0],
                tasks: tasks.map(t => ({ task: t, completed: false }))
            };
            saveWeeklyPlan(newPlan);
        } catch (error) {
            console.error("Failed to generate plan:", error);
        } finally {
            setIsPlanLoading(false);
        }
    };

    const unlockedAchievementIds = new Set(motivationData.unlockedAchievements);

    return (
        <div className="space-y-6">
            <Card className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-gradient-to-r from-sky-100 to-indigo-100 dark:from-sky-900/50 dark:to-indigo-900/50 p-6">
                <span className="text-5xl">🔥</span>
                <div>
                    <p className="text-3xl font-bold text-center sm:text-left">{motivationData.currentStreak} Günlük Seri</p>
                    <p className="text-center sm:text-left text-[rgb(var(--muted-foreground))]">Seriyi devam ettirmek için yarın tekrar gel!</p>
                </div>
            </Card>

            {!motivationData.userLevel || !motivationData.userGoal ? (
                <LearningPlanSetup onSave={handleSavePreferences} />
            ) : (
                <LearningPlanDisplay 
                    level={motivationData.userLevel}
                    goal={motivationData.userGoal}
                    plan={motivationData.weeklyPlan}
                    onGenerate={handleGeneratePlan}
                    onToggleTask={toggleTaskCompletion}
                    isLoading={isPlanLoading}
                />
            )}
            
            <AchievementsGrid unlockedIds={unlockedAchievementIds} />
        </div>
    );
};