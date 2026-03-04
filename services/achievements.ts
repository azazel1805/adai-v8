import type { Achievement } from '../types';
import type { ProgressData } from '../types';
import type { NotebookData } from '../types';
import type { MotivationData } from '../types';
import { TOOL_CATEGORIES } from '../constants';

export const ALL_ACHIEVEMENTS: Achievement[] = [
    // Streaks
    { id: 'streak-3', name: 'Ateş Başladı', description: '3 gün üst üste giriş yap.', icon: '🔥' },
    { id: 'streak-7', name: 'Haftalık Seri', description: '7 gün üst üste giriş yap.', icon: '📅' },
    { id: 'streak-30', name: 'Aylık Adanmışlık', description: '30 gün üst üste giriş yap.', icon: '🗓️' },

    // Notebook
    { id: 'vocab-10', name: 'Kelime Avcısı', description: 'Defterine 10 kelime kaydet.', icon: '🏹' },
    { id: 'vocab-50', name: 'Sözlük Meraklısı', description: 'Defterine 50 kelime kaydet.', icon: '🧐' },
    { id: 'essay-1', name: 'İlk Adım', description: 'İlk essay\'ini kaydet.', icon: '✍️' },
    { id: 'essay-5', name: 'Kalem Ustalığı', description: '5 farklı essay kaydet.', icon: '🖋️' },
    { id: 'notes-1', name: 'Not Alıcı', description: 'Genel notlar bölümüne en az 50 karakterlik not yaz.', icon: '🗒️' },
    
    // Practice
    { id: 'listen-5', name: 'Keskin Kulak', description: '5 dinleme alıştırması sorusu çöz.', icon: '👂' },
    { id: 'listen-25', name: 'Dinleme Uzmanı', description: '25 dinleme alıştırması sorusu çöz.', icon: '🎧' },
    { id: 'speak-1', name: 'Buzları Kır', description: 'İlk konuşma simülasyonunu tamamla.', icon: '💬' },
    { id: 'speak-10', name: 'Sosyal Kelebek', description: '10 konuşma simülasyonu tamamla.', icon: '🦋' },
    
    // Tools
    { id: 'translate-10', name: 'Tercüman', description: 'Detaylı Çevirmen ile 10 çeviri yap ve kaydet.', icon: '🌐' },
    { id: 'rephrase-10', name: 'Söz Sanatçısı', description: 'Cümle Yeniden Yazıcı ile 10 çeşitleme kaydet.', icon: '🎨' },
    { id: 'grammar-check-10', name: 'Gramer Polisi', description: 'Gramer Kontrolü\'nü 10 kez kullan.', icon: '👮' },
    
    // Secret
    { id: 'secret-1', name: 'Gizli Kaşif', description: 'Tüm araçları en az bir kere ziyaret et.', icon: '🗺️', isSecret: true },
];

export const checkNewlyUnlockedAchievements = (
    progress: ProgressData, 
    notebook: NotebookData, 
    motivation: MotivationData
): string[] => {
    const newlyUnlocked: string[] = [];
    const alreadyUnlocked = new Set(motivation.unlockedAchievements);

    const check = (id: string, condition: boolean) => {
        if (!alreadyUnlocked.has(id) && condition) {
            newlyUnlocked.push(id);
        }
    };
    
    // Streak checks
    check('streak-3', motivation.currentStreak >= 3);
    check('streak-7', motivation.currentStreak >= 7);
    check('streak-30', motivation.currentStreak >= 30);
    
    // Notebook checks
    check('vocab-10', notebook.vocabulary.length >= 10);
    check('vocab-50', notebook.vocabulary.length >= 50);
    check('essay-1', notebook.essays.length >= 1);
    check('essay-5', notebook.essays.length >= 5);
    check('notes-1', notebook.notes.length > 50);
    check('translate-10', notebook.translations.length >= 10);
    check('rephrase-10', notebook.rephrasings.length >= 10);
    
    // Progress checks
    check('listen-5', progress.listeningAccuracy.total >= 5);
    check('listen-25', progress.listeningAccuracy.total >= 25);
    check('speak-1', progress.speakingSessions >= 1);
    check('speak-10', progress.speakingSessions >= 10);
    check('grammar-check-10', (progress.grammarChecks || 0) >= 10);
    
    // Secret Achievement
    const allToolIds = TOOL_CATEGORIES.flatMap(cat => cat.tools.map(t => t.id));
    const visitedToolsSet = new Set(progress.visitedTools || []);
    const allToolsVisited = allToolIds.every(id => visitedToolsSet.has(id));
    check('secret-1', allToolsVisited);

    return newlyUnlocked;
};
