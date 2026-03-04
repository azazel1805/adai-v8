import React, { useState, useEffect, useCallback } from 'react';
import type { StorySegment } from '../types';
import { getInteractiveStorySegment } from '../services/geminiService';
import { getImageForWord } from '../services/pexelsService';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';

const GENRES = ['Mystery', 'Sci-Fi', 'Fantasy', 'Adventure', 'Horror'];

export const InteractiveStoryView: React.FC = () => {
    const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
    const [history, setHistory] = useState<{ userChoice: string }[]>([]);
    const [currentSegment, setCurrentSegment] = useState<StorySegment | null>(null);
    const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fullStory, setFullStory] = useState<{ storyPart: string; imageUrl: string | null; }[]>([]);

    const fetchSegment = useCallback(async (genre: string, newHistory: { userChoice: string }[], forceEnd: boolean = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const segment = await getInteractiveStorySegment(genre, newHistory, forceEnd);
            setCurrentSegment(segment);
            let imageUrl: string | null = null;
            if (segment.imagePrompt) {
                imageUrl = await getImageForWord(segment.imagePrompt);
                setBackgroundImageUrl(imageUrl);
            } else {
                setBackgroundImageUrl(null);
            }
            setFullStory(prev => [...prev, { storyPart: segment.storyPart, imageUrl }]);
        } catch (e) {
            console.error(e);
            setError('Hikaye devam ettirilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleStartStory = (genre: string) => {
        setSelectedGenre(genre);
        setHistory([]);
        setCurrentSegment(null);
        setBackgroundImageUrl(null);
        setFullStory([]);
        fetchSegment(genre, []);
    };

    const handleChoice = (choice: string) => {
        if (!selectedGenre) return;
        const newHistory = [...history, { userChoice: choice }];
        setHistory(newHistory);
        fetchSegment(selectedGenre, newHistory);
    };
    
    const handleRestart = () => {
        setSelectedGenre(null);
        setHistory([]);
        setCurrentSegment(null);
        setBackgroundImageUrl(null);
        setError(null);
        setIsLoading(false);
        setFullStory([]);
    };

    const handleFinishStory = () => {
        if (!selectedGenre) return;
        fetchSegment(selectedGenre, history, true);
    };

    const handleDownloadPdf = async () => {
        if (!selectedGenre || fullStory.length === 0) return;
        setIsLoading(true);
        setError(null);
    
        const pdfContainer = document.createElement('div');
        Object.assign(pdfContainer.style, {
            position: 'absolute',
            left: '-9999px',
            top: '0',
            width: '210mm',
            padding: '20mm',
            backgroundColor: 'white',
            color: 'black',
            fontFamily: 'Inter, sans-serif',
            boxSizing: 'border-box'
        });
        
        let contentHtml = `<h1 style="font-size: 28px; text-align: center; margin-bottom: 20px; font-weight: bold;">${selectedGenre} Story</h1>`;
        
        for (const segment of fullStory) {
            contentHtml += `<div style="margin-bottom: 25px; page-break-inside: avoid;">`;
            contentHtml += `<p style="font-size: 14px; line-height: 1.6; margin-bottom: 15px;">${segment.storyPart.replace(/\n/g, '<br/>')}</p>`;
            if (segment.imageUrl) {
                contentHtml += `<img crossOrigin="anonymous" src="${segment.imageUrl}" style="max-width: 100%; height: auto; border-radius: 8px;" />`;
            }
            contentHtml += `</div>`;
        }
    
        pdfContainer.innerHTML = contentHtml;
        document.body.appendChild(pdfContainer);
    
        // Wait for images to potentially load
        await new Promise(resolve => setTimeout(resolve, 2500));
    
        try {
            const canvas = await window.html2canvas(pdfContainer, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false,
            });
    
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });
            
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let heightLeft = pdfHeight;
            let position = 0;
            
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
    
            while (heightLeft > 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
    
            pdf.save(`${selectedGenre.toLowerCase().replace(' ', '-')}-story.pdf`);
    
        } catch (e) {
            console.error("PDF generation failed:", e);
            setError("PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            document.body.removeChild(pdfContainer);
            setIsLoading(false);
        }
    };

    if (!selectedGenre) {
        return (
            <Card>
                <div className="text-center">
                    <h2 className="text-2xl font-bold">İnteraktif Hikaye Modu</h2>
                    <p className="text-[rgb(var(--muted-foreground))] mt-2 mb-6">Bir tür seçin ve kendi maceranızı yaratın!</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {GENRES.map(genre => (
                            <Button key={genre} onClick={() => handleStartStory(genre)} className="!h-24 !text-lg">
                                {genre}
                            </Button>
                        ))}
                    </div>
                </div>
            </Card>
        );
    }

    return (
        <div 
            className="relative h-full min-h-[60vh] flex flex-col justify-end p-6 sm:p-8 rounded-xl overflow-hidden text-white shadow-lg border border-[rgb(var(--border))]"
            style={{
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0.2) 100%), url(${backgroundImageUrl || ''})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease-in-out',
            }}
        >
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                {currentSegment && !currentSegment.isEnding && (
                    <Button onClick={handleFinishStory} variant="secondary">Hikayeyi Bitir</Button>
                )}
                 {currentSegment && currentSegment.isEnding && (
                    <Button onClick={handleDownloadPdf} variant="secondary">PDF Olarak İndir</Button>
                )}
                <Button onClick={handleRestart} variant="secondary">Yeni Hikaye</Button>
            </div>

            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <Loader text="Hikaye oluşturuluyor..." />
                </div>
            )}
            
            {error && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 p-4">
                    <p className="text-red-400 text-center mb-4">{error}</p>
                    <Button onClick={() => fetchSegment(selectedGenre, history)}>Tekrar Dene</Button>
                </div>
            )}

            {!isLoading && currentSegment && (
                <div className="relative z-10 space-y-6 animate-fade-in-up">
                    <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap">{currentSegment.storyPart}</p>

                    {currentSegment.isEnding ? (
                         <div>
                            <p className="font-bold text-2xl text-amber-300">HİKAYENİN SONU</p>
                            <p className="mt-2">Hikayenizi yukarıdaki butonu kullanarak PDF olarak indirebilir veya yeni bir maceraya başlayabilirsiniz.</p>
                         </div>
                    ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {currentSegment.choices.map((choice, index) => (
                                <Button 
                                    key={index}
                                    onClick={() => handleChoice(choice)}
                                    className="!justify-start !text-left !p-4 !bg-white/10 hover:!bg-white/20 backdrop-blur-sm !text-white"
                                >
                                    {choice}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};