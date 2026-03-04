import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { DictionaryResult, IdentifiedObject } from '../types';
import { getWordDetails, identifyImageObjects } from '../services/geminiService';
import { getImageForWord } from '../services/pexelsService';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { Card } from './common/Card';
import { useNotebook } from '../hooks/useNotebook';

type Mode = 'text' | 'camera';

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject('Failed to convert blob to base64');
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// --- ICONS ---
const SpeakerWaveIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const TextIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m-1.125 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
);

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);
// --- END ICONS ---


export const DictionaryView: React.FC = () => {
  const [mode, setMode] = useState<Mode>('text');
  
  // Text Mode State
  const [word, setWord] = useState('');
  const [result, setResult] = useState<DictionaryResult | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { addWord, notebookData } = useNotebook();

  // Camera Mode State
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [identifiedObjects, setIdentifiedObjects] = useState<IdentifiedObject[] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (word && notebookData.vocabulary.some(w => w.word.toLowerCase() === word.toLowerCase())) {
        setIsSaved(true);
    } else {
        setIsSaved(false);
    }
  }, [word, notebookData.vocabulary, result]);


  const startCamera = useCallback(async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraError("Kamera erişimi reddedildi veya bir hata oluştu. Lütfen tarayıcı izinlerinizi kontrol edin.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    // Cleanup on component unmount
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);


  const handleSearchWord = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!word.trim()) return;
    setIsTextLoading(true);
    setResult(null);
    setImageUrl(null);
    try {
      const details = await getWordDetails(word);
      setResult(details);
      const image = await getImageForWord(word);
      setImageUrl(image);
    } catch (error) {
      console.error("Error fetching word details:", error);
      setResult(null); // Clear previous results on error
    } finally {
      setIsTextLoading(false);
    }
  };

  const playPronunciation = () => {
      if (!word || isAudioLoading || !('speechSynthesis' in window)) return;
      setIsAudioLoading(true);
      try {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.onend = () => setIsAudioLoading(false);
        utterance.onerror = (e) => {
            console.error("SpeechSynthesis Error", e);
            setIsAudioLoading(false);
        };
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("Error playing pronunciation:", error);
        setIsAudioLoading(false);
      }
  };

  const handleSaveWord = () => {
    if (result && word) {
        addWord({ 
            id: word.toLowerCase(), 
            word: word, 
            details: result,
            imageUrl: imageUrl
        });
    }
  };
  
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCameraLoading(true);
    setIdentifiedObjects(null);
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(async (blob) => {
        if (blob) {
            try {
                const base64Data = await blobToBase64(blob);
                const results = await identifyImageObjects(base64Data, blob.type);
                setIdentifiedObjects(results);
            } catch (error) {
                console.error("Error identifying object:", error);
                setCameraError("Nesne tanımlanırken bir hata oluştu.");
            } finally {
                setIsCameraLoading(false);
            }
        }
    }, 'image/jpeg', 0.9);
  };

  const renderTextMode = () => (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSearchWord} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Explore a word..."
            className="w-full p-3 pl-12 bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none transition-shadow placeholder:text-[rgb(var(--muted-foreground))]"
          />
          <Button type="submit" disabled={isTextLoading} className="absolute right-2 top-1/2 -translate-y-1/2 !py-2">
            {isTextLoading ? '...' : 'Search'}
          </Button>
        </form>
      </Card>
      
      {isTextLoading && <Loader text="Fetching details..." />}
      
      {!isTextLoading && !result && (
        <div className="text-center py-20 text-[rgb(var(--muted-foreground))]">
            <BookOpenIcon className="w-24 h-24 mx-auto mb-6 text-[rgb(var(--border))]"/>
            <h3 className="text-2xl font-bold text-[rgb(var(--foreground))]">Discover a New Word</h3>
            <p className="mt-2">Start by typing a word in the search bar above.</p>
        </div>
      )}

      {result && (
        <Card>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-5xl font-extrabold capitalize text-[rgb(var(--foreground))]">{word}</h2>
                        <div className="flex items-center gap-2 text-2xl text-[rgb(var(--muted-foreground))] mt-2">
                            <span>{result.pronunciation}</span>
                            <button onClick={playPronunciation} disabled={isAudioLoading} className="p-1 text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--primary))] disabled:opacity-50 transition-colors">
                                {isAudioLoading ? <div className="w-5 h-5 border-2 border-[rgb(var(--muted-foreground))] border-t-transparent rounded-full animate-spin"></div> : <SpeakerWaveIcon className="w-5 h-5"/>}
                            </button>
                        </div>
                    </div>
                    <Button onClick={handleSaveWord} disabled={isSaved} variant="secondary">
                        {isSaved ? 'Saved' : 'Save Word'}
                    </Button>
                </div>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl text-[rgb(var(--foreground))] border-b-2 border-[rgb(var(--border))] pb-2 mb-4">Meanings</h3>
                  <ul className="space-y-4">
                      {result.definitions.map((def, i) => (
                        <li key={i}>
                            <p className="font-semibold text-lg text-[rgb(var(--foreground))]">{def.english}</p>
                            <p className="text-[rgb(var(--muted-foreground))] italic">{def.turkish}</p>
                        </li>
                      ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-bold text-xl text-[rgb(var(--foreground))] border-b-2 border-[rgb(var(--border))] pb-2 mb-4">Synonyms</h3>
                         <div className="flex flex-wrap gap-2 mt-2">
                            {result.synonyms.english.length > 0 ? result.synonyms.english.map(s => (
                                <span key={s} className="bg-[rgb(var(--muted))] px-3 py-1 rounded-full text-sm font-medium text-[rgb(var(--muted-foreground))]">{s}</span>
                            )) : <p className="text-[rgb(var(--muted-foreground))] italic">N/A</p>}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-[rgb(var(--foreground))] border-b-2 border-[rgb(var(--border))] pb-2 mb-4">Antonyms</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {result.antonyms.english.length > 0 ? result.antonyms.english.map(a => (
                                <span key={a} className="bg-[rgb(var(--muted))] px-3 py-1 rounded-full text-sm font-medium text-[rgb(var(--muted-foreground))]">{a}</span>
                            )) : <p className="text-[rgb(var(--muted-foreground))] italic">N/A</p>}
                        </div>
                    </div>
                </div>
                 <div>
                  <h3 className="font-bold text-xl text-[rgb(var(--foreground))] border-b-2 border-[rgb(var(--border))] pb-2 mb-4">Etymology</h3>
                  <p className="text-[rgb(var(--muted-foreground))]">{result.etymology}</p>
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
                {imageUrl ? 
                    <img src={imageUrl} alt={word} className="rounded-xl object-cover w-full h-full min-h-64 shadow-lg" /> :
                    <div className="rounded-xl bg-[rgb(var(--muted))] flex items-center justify-center min-h-64 w-full h-full"><p className="text-[rgb(var(--muted-foreground))]">No image found</p></div>
                }
            </div>
          </div>
        </Card>
      )}
    </div>
  );

  const renderCameraMode = () => (
    <div className="space-y-6">
        <Card>
            {cameraError ? (
                <div className="text-center py-8">
                    <p className="text-red-500 font-semibold">{cameraError}</p>
                    <Button onClick={startCamera} className="mt-4">Try Again</Button>
                </div>
            ) : (
                <>
                <div className="relative bg-black rounded-lg overflow-hidden shadow-md">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-auto aspect-video object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                </div>
                <Button onClick={handleCapture} disabled={isCameraLoading} className="mt-4 w-full !py-3 text-lg">
                    {isCameraLoading ? 'Identifying...' : 'Identify Objects'}
                </Button>
                </>
            )}
        </Card>
        {isCameraLoading && <Loader text="Analyzing image..." />}
        {identifiedObjects && (
             <Card>
                <h3 className="text-xl font-semibold mb-4">Identified Objects</h3>
                {identifiedObjects.length > 0 ? (
                    <ul className="list-disc list-inside space-y-2">
                        {identifiedObjects.map((obj, i) => <li key={i} className="text-lg">{obj.englishName} <span className="text-[rgb(var(--muted-foreground))]">({obj.turkishName})</span></li>)}
                    </ul>
                ) : (
                    <p className="text-[rgb(var(--muted-foreground))]">No identifiable objects found. Try a clearer picture!</p>
                )}
             </Card>
        )}
    </div>
  );
  
  const BookOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
  );

  return (
    <div className="space-y-6">
        <div className="bg-[rgb(var(--muted))] rounded-lg p-1 flex max-w-sm mx-auto">
            <button 
                onClick={() => setMode('text')}
                className={`w-1/2 rounded-md py-2 px-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${mode === 'text' ? 'bg-[rgb(var(--card))] text-[rgb(var(--primary))] shadow-md' : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgba(var(--card),0.5)]'}`}
            >
                <TextIcon className="w-5 h-5" />
                Text Search
            </button>
            <button 
                onClick={() => setMode('camera')}
                className={`w-1/2 rounded-md py-2 px-4 text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${mode === 'camera' ? 'bg-[rgb(var(--card))] text-[rgb(var(--primary))] shadow-md' : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgba(var(--card),0.5)]'}`}
            >
                <CameraIcon className="w-5 h-5" />
                Camera Search
            </button>
        </div>
        {mode === 'text' ? renderTextMode() : renderCameraMode()}
    </div>
  );
};