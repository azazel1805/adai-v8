import React from 'react';
import type { Tool, ToolCategory } from './types';

export const NOTEBOOK_TOOL: Tool = { id: 'notebook', name: 'Defterim', description: 'Notlarınızı, kelimelerinizi ve öğrendiğiniz konuları kişisel defterinize kaydedin.', icon: '📓' };

export const TOOL_CATEGORIES: ToolCategory[] = [
  {
    id: 'core-learning',
    name: 'Temel Öğrenim',
    description: 'Gramer, kelime bilgisi ve özel ders için temel beceriler.',
    icon: '📚',
    tools: [
      { id: 'ai-tutor', name: 'AI Eğitmen', description: 'İngilizce öğrenimiyle ilgili her türlü sorunuza anında, kişiselleştirilmiş yanıtlar alın.', icon: '🧑‍🏫' },
      { id: 'dictionary', name: 'Sözlük', description: 'Kelimelerin anlamlarını, eş/zıt anlamlılarını, kökenini ve görselini keşfedin. Kamerayla nesneleri tanıyın.', icon: '📖' },
      { id: 'tenses-module', name: 'Zamanlar Modülü', description: 'Tüm İngilizce zamanlarını detaylı açıklamalar ve kapsamlı alıştırmalarla öğrenin.', icon: '⏰' },
      { id: 'academic-grammar-module', name: 'Akademik Gramer', description: 'If Clauses, Relative Clauses gibi ileri düzey gramer konularını öğrenin.', icon: '🏛️' },
    ],
  },
  {
    id: 'practice-skills',
    name: 'Pratik ve Beceriler',
    description: 'Dinleme, konuşma ve problem çözme becerilerinizi geliştirmek için alıştırmalar.',
    icon: '🎯',
    tools: [
      { id: 'listening-practice', name: 'Dinleme Alıştırması', description: 'Seviyenize uygun dinleme metinleri ve soruları oluşturarak anlama becerilerinizi geliştirin.', icon: '🎧' },
      { id: 'speaking-simulator', name: 'Konuşma Simülatörü', description: 'Gerçekçi senaryolarla konuşma pratiği yaparak akıcılığınızı ve özgüveninizi artırın.', icon: '💬' },
      { id: 'pronunciation-coach', name: 'Telaffuz Koçu', description: 'Kelimelerin ve cümlelerin telaffuzunu pratik yapın ve AI\'dan anında geri bildirim alın.', icon: '🗣️' },
      { id: 'sentence-scrambler', name: 'Cümle Kurma Alıştırması', description: 'Karışık haldeki kelimeleri doğru sıraya dizerek cümle kurma pratiği yapın.', icon: '🧩' },
      { id: 'interactive-story', name: 'İnteraktif Hikaye', description: 'Verdiğiniz kararlarla şekillenen macera dolu hikayelere atılarak İngilizce pratiği yapın.', icon: '🗺️' },
      { id: 'homework-helper', name: 'Soru Çözücü', description: 'Takıldığınız alıştırma veya soruların fotoğrafını çekin veya metnini yazın, AI detaylı açıklama ve çözüm sunsun.', icon: '💡' },
    ],
  },
  {
    id: 'writing-tools',
    name: 'Yazma Araçları',
    description: 'Essaylerden cümle yapısına ve dilbilgisi kontrolüne kadar her konuda yardımcı olacak araçlar.',
    icon: '✍️',
    tools: [
      { id: 'essay-helper', name: 'Essay Yardımcısı', description: 'Essay konuları bulun, taslaklar oluşturun ve hatta tam metin essayler yazdırın.', icon: '📝' },
      { id: 'sentence-rephraser', name: 'Cümle Yeniden Yazıcı', description: 'Bir cümleyi daha basit, resmi, gayriresmi, argo veya karmaşık şekillerde yeniden yazdırın.', icon: '🔄' },
      { id: 'paragraph-analyzer', name: 'Paragraf Analizcisi', description: 'Bir paragrafın cümlelerini basitleştirin ve yapısal rollerini renklerle görselleştirin.', icon: '🔍' },
      { id: 'grammar-checker', name: 'Gramer Kontrolü', description: 'Metinlerinizdeki gramer hatalarını bulun, düzeltin ve açıklamalarını öğrenin.', icon: '✅' },
      { id: 'style-tone-analyzer', name: 'Üslup ve Ton Analizcisi', description: 'Metinlerinizin tonunu analiz edin ve hedef kitlenize/amacınıza göre iyileştirme önerileri alın.', icon: '🎭' },
    ],
  },
  {
    id: 'personal-development',
    name: 'Kişisel Gelişim',
    description: 'Motivasyonunuzu artırın ve ilerlemenizi takip edin.',
    icon: '🚀',
    tools: [
      { id: 'motivation-goals', name: 'Motivasyon & Hedefler', description: 'Günlük seriler, başarımlar ve kişisel öğrenme planları ile motive kalın.', icon: '🏆' },
      { id: 'progress-tracker', name: 'İlerleme Takibi', description: 'Öğrenme istatistiklerinizi, pratik sürenizi ve doğruluk puanlarınızı takip edin.', icon: '📊' },
    ],
  },
  {
    id: 'creative-utility',
    name: 'Yaratıcı ve Yardımcı Araçlar',
    description: 'İçerik oluşturun, detaylı çeviriler alın ve kişisel not defterinizi yönetin.',
    icon: '🛠️',
    tools: [
      { id: 'content-analyzer', name: 'İçerik Analizcisi', description: 'Bir metin veya transkript ile kelime listeleri, özetler ve anlama soruları oluşturun.', icon: '🔗' },
      { id: 'podcast-creator', name: 'Podcast Oluşturucu', description: 'Kendi metinlerinizden, ayarlanabilir ses ve hızda indirilebilir podcastler yaratın.', icon: '🎙️' },
      { id: 'detailed-translator', name: 'Detaylı Çevirmen', description: 'Bir cümleyi çevirin ve gramer yapısı, çeviri mantığı ve alternatifler hakkında detaylı analiz alın.', icon: '🌐' },
      { id: 'settings', name: 'Ayarlar', description: 'Uygulama görünümünü ve temasını kişiselleştirin.', icon: '⚙️' },
    ],
  },
];

export const PEXELS_API_KEY = "BXJTqpDqYKrp57GTOT012YKebRMmDDGBfDVHoUDu3gdNNwr13TMbJLWq";