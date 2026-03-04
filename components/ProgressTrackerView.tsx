import React from 'react';
import { useProgress } from '../hooks/useProgress';
import { useNotebook } from '../hooks/useNotebook';
import { useMotivation } from '../hooks/useMotivation';
import { Card } from './common/Card';

// --- ICONS ---
const FireIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.362-3.797 8.33 8.33 0 0 1 3-1.586Z" /></svg>);
const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9a9.75 9.75 0 0 0 9 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 15.75c0-4.303-3.483-7.78-7.765-7.78a7.76 7.76 0 0 0-7.765 7.78" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-4.243" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5a3.75 3.75 0 0 1 3.75 3.75H8.25A3.75 3.75 0 0 1 12 4.5Z" /></svg>);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const SpeakerWaveIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /></svg>);
const PencilSquareIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 19.5a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125M12 15v5.25A2.25 2.25 0 0 0 14.25 22.5h5.25a2.25 2.25 0 0 0 2.25-2.25V15M12 15H9.75a2.25 2.25 0 0 1-2.25-2.25V7.5A2.25 2.25 0 0 1 9.75 5.25h5.25a2.25 2.25 0 0 1 2.25 2.25V15" /></svg>);
const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.72 3.72a.75.75 0 0 1-1.06 0l-3.72-3.72A2.523 2.523 0 0 1 9.75 16.5c0-.492.176-.96.464-1.336a5.21 5.21 0 0 1-1.242.235c-2.12 0-3.847-1.727-3.847-3.847v-2.571c0-2.12 1.727-3.847 3.847-3.847a4.91 4.91 0 0 1 1.954.434c.225-.434.502-.817.82-1.128a5.21 5.21 0 0 1 7.234-1.242 5.21 5.21 0 0 1 1.242 7.234Z" /></svg>);
const CheckBadgeIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>);
const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>);
const LanguageIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.625M21 21l-5.25-11.625M3.75 5.25c0-1.036.84-1.875 1.875-1.875h13.125c1.036 0 1.875.84 1.875 1.875v3.375c0 .341-.018.674-.053.996l-1.348 7.414A2.25 2.25 0 0 1 18 21H6a2.25 2.25 0 0 1-2.22-1.965L2.403 9.621a4.5 4.5 0 0 1-.053-.996V5.25Z" /></svg>);
const ArrowsRightLeftIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>);
const SparklesIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" /></svg>);
// --- END ICONS ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; colorClass: string }> = ({ title, value, icon, colorClass }) => (
    <Card className="flex items-center gap-4 p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">{title}</p>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{value}</p>
        </div>
    </Card>
);

const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({ percentage, size = 120, strokeWidth = 10 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    className="text-[rgb(var(--border))]"
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className="text-[rgb(var(--primary))]"
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    transform={`rotate(-90 ${size/2} ${size/2})`}
                    style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{`${Math.round(percentage)}%`}</span>
            </div>
        </div>
    );
};

export const ProgressTrackerView: React.FC = () => {
    const { progressData } = useProgress();
    const { notebookData } = useNotebook();
    const { motivationData } = useMotivation();

    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${String(hours)}s ${String(minutes).padStart(2, '0')}d`;
    };

    const listeningPercentage = progressData.listeningAccuracy.total > 0
        ? (progressData.listeningAccuracy.correct / progressData.listeningAccuracy.total) * 100
        : 0;

    const stats = {
        overview: [
            { title: "Güncel Seri", value: `${motivationData.currentStreak} gün`, icon: <FireIcon className="w-6 h-6 text-rose-500" />, color: "bg-rose-100 dark:bg-rose-900/50" },
            { title: "Kazanılan Başarımlar", value: motivationData.unlockedAchievements.length, icon: <TrophyIcon className="w-6 h-6 text-amber-500" />, color: "bg-amber-100 dark:bg-amber-900/50" },
            { title: "Toplam Pratik Süresi", value: formatTime(progressData.totalPracticeTime), icon: <ClockIcon className="w-6 h-6 text-indigo-500" />, color: "bg-indigo-100 dark:bg-indigo-900/50" },
        ],
        skillDevelopment: [
            { title: "Konuşma Pratiği", value: progressData.speakingSessions, icon: <ChatBubbleLeftRightIcon className="w-6 h-6 text-sky-500" />, color: "bg-sky-100 dark:bg-sky-900/50" },
            { title: "Yazılan Essay", value: progressData.essaysWritten, icon: <PencilSquareIcon className="w-6 h-6 text-lime-500" />, color: "bg-lime-100 dark:bg-lime-900/50" },
            { title: "Telaffuz Alıştırması", value: progressData.pronunciationSessions, icon: <SpeakerWaveIcon className="w-6 h-6 text-violet-500" />, color: "bg-violet-100 dark:bg-violet-900/50" },
            { title: "Gramer Kontrolü", value: progressData.grammarChecks, icon: <CheckBadgeIcon className="w-6 h-6 text-emerald-500" />, color: "bg-emerald-100 dark:bg-emerald-900/50" },
        ],
        notebookSummary: [
            { title: "Öğrenilen Kelime", value: notebookData.vocabulary.length, icon: <BookOpenIcon className="w-6 h-6 text-orange-500" />, color: "bg-orange-100 dark:bg-orange-900/50" },
            { title: "Kaydedilen Çeviriler", value: notebookData.translations.length, icon: <LanguageIcon className="w-6 h-6 text-cyan-500" />, color: "bg-cyan-100 dark:bg-cyan-900/50" },
            { title: "Kaydedilen Çeşitlemeler", value: notebookData.rephrasings.length, icon: <ArrowsRightLeftIcon className="w-6 h-6 text-fuchsia-500" />, color: "bg-fuchsia-100 dark:bg-fuchsia-900/50" },
            { title: "Analiz Edilen İçerik", value: progressData.contentAnalyzed, icon: <SparklesIcon className="w-6 h-6 text-pink-500" />, color: "bg-pink-100 dark:bg-pink-900/50" },
        ]
    };

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center text-[rgb(var(--foreground))]">İlerleme Raporu</h2>
            
            <section>
                <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--muted-foreground))]">Genel Bakış</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stats.overview.map(stat => <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} colorClass={stat.color} />)}
                </div>
            </section>
            
            <section>
                <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--muted-foreground))]">Beceri Gelişimi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card className="flex flex-col items-center justify-center p-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                        <CircularProgress percentage={listeningPercentage} />
                        <p className="font-semibold mt-2">Dinleme Başarısı</p>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">({progressData.listeningAccuracy.correct} / {progressData.listeningAccuracy.total} doğru)</p>
                    </Card>
                    {stats.skillDevelopment.map(stat => <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} colorClass={stat.color} />)}
                </div>
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-4 text-[rgb(var(--muted-foreground))]">Defterim Özeti</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.notebookSummary.map(stat => <StatCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} colorClass={stat.color} />)}
                </div>
            </section>
        </div>
    );
};