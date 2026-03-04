import React, { useState, useRef } from 'react';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { Loader } from './common/Loader';
import { getHomeworkHelp } from '../services/geminiService';
import type { HomeworkSolution } from '../types';

type Mode = 'text' | 'image';

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

const CameraIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.776 48.776 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
    </svg>
);

const CheckCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const LightBulbIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.311a7.5 7.5 0 0 1-7.5 0c-1.453-.16-2.863-.996-3.838-2.175a4.5 4.5 0 0 1-.344-4.243c.334-1.453.996-2.863 2.175-3.838a4.5 4.5 0 0 1 4.243-.344 7.5 7.5 0 0 1 7.5 0c1.453.334 2.863.996 3.838 2.175a4.5 4.5 0 0 1 .344 4.243c-.334 1.453-.996-2.863-2.175-3.838a4.5 4.5 0 0 1-4.243.344Z" />
    </svg>
);

const XCircleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);


export const HomeworkHelperView: React.FC = () => {
    const [mode, setMode] = useState<Mode>('text');
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [result, setResult] = useState<HomeworkSolution | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGetHelp = async () => {
        if ((mode === 'text' && !text.trim()) || (mode === 'image' && !imageFile)) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            let response: HomeworkSolution;
            if (mode === 'image' && imageFile) {
                const base64Data = await blobToBase64(imageFile);
                response = await getHomeworkHelp({
                    text: text || "Please explain the question in the image.", // Use text as context or provide a default.
                    image: { base64Data, mimeType: imageFile.type }
                });
            } else {
                response = await getHomeworkHelp({ text });
            }
            setResult(response);
        } catch (err) {
            console.error("Error in Homework Helper:", err);
            setError("Çözüm alınırken bir hata oluştu. Lütfen tekrar deneyin.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const resetImageState = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }

    const switchMode = (newMode: Mode) => {
        setMode(newMode);
        setResult(null);
        setError(null);
        setText('');
        resetImageState();
    }

    return (
        <div className="space-y-6">
            <Card>
                 <div className="flex space-x-2 mb-4">
                    <Button
                        onClick={() => switchMode('text')}
                        variant={mode === 'text' ? 'primary' : 'secondary'}
                        className="flex-1"
                    >
                        Metin Gir
                    </Button>
                    <Button
                        onClick={() => switchMode('image')}
                        variant={mode === 'image' ? 'primary' : 'secondary'}
                        className="flex-1"
                    >
                        Görsel Yükle
                    </Button>
                </div>
                
                {mode === 'text' ? (
                     <div>
                        <label htmlFor="question-input" className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1">
                            Sorunuz veya alıştırmanız
                        </label>
                        <textarea
                            id="question-input"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Çözmekte zorlandığınız soruyu veya metni buraya yapıştırın..."
                            className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] rounded-md h-48 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                            disabled={isLoading}
                        />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {imagePreview ? (
                             <div className="relative">
                                <img src={imagePreview} alt="Soru önizlemesi" className="max-w-full max-h-96 mx-auto rounded-md" />
                                <Button variant="secondary" onClick={resetImageState} className="absolute top-2 right-2 !p-2">
                                    X
                                </Button>
                            </div>
                        ) : (
                             <button
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-[rgb(var(--border))] rounded-md hover:bg-[rgb(var(--muted))] transition-colors"
                             >
                                <CameraIcon className="w-12 h-12 text-[rgb(var(--muted-foreground))] mb-2" />
                                <span className="text-[rgb(var(--foreground))] font-semibold">Görsel Yüklemek için Tıklayın</span>
                                <span className="text-sm text-[rgb(var(--muted-foreground))]">veya sürükleyip bırakın</span>
                            </button>
                        )}
                       
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                        />
                         <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Görselle ilgili ek bir notunuz veya özel bir sorunuz varsa buraya yazabilirsiniz (isteğe bağlı)..."
                            className="w-full p-2 bg-[rgb(var(--card))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] rounded-md h-24 focus:ring-2 focus:ring-[rgb(var(--ring))] focus:outline-none placeholder:text-[rgb(var(--muted-foreground))]"
                            disabled={isLoading}
                        />
                    </div>
                )}

                <Button
                    onClick={handleGetHelp}
                    disabled={isLoading || (mode === 'text' && !text.trim()) || (mode === 'image' && !imageFile)}
                    className="mt-4"
                >
                    {isLoading ? 'Çözülüyor...' : 'Yardım Al'}
                </Button>
            </Card>

            {isLoading && <Loader />}
            {error && <p className="text-red-500 text-center">{error}</p>}

            {result && (
                <Card>
                    <h3 className="text-3xl font-bold mb-8 text-center text-[rgb(var(--foreground))]">Çözüm Analizi</h3>
                    <div className="space-y-10">
                        {/* Correct Answer */}
                        <div>
                            <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                                <CheckCircleIcon className="w-7 h-7 text-green-600" />
                                Doğru Cevap
                            </h4>
                            <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-sm">
                                <p className="text-green-800 dark:text-green-200 font-bold text-2xl">{result.correctAnswer}</p>
                            </div>
                        </div>

                        {/* Step by Step Solution */}
                        {result.stepByStepSolution && result.stepByStepSolution.length > 0 && (
                            <div>
                                <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-6">Adım Adım Çözüm</h4>
                                <div className="flow-root">
                                  <ul className="-mb-8">
                                    {result.stepByStepSolution.map((step, stepIdx) => (
                                      <li key={step.stepNumber}>
                                        <div className="relative pb-8">
                                          {stepIdx !== result.stepByStepSolution.length - 1 ? (
                                            <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-[rgb(var(--border))]" aria-hidden="true" />
                                          ) : null}
                                          <div className="relative flex items-start space-x-4">
                                            <div className="h-10 w-10 bg-[rgb(var(--primary))] rounded-full ring-8 ring-[rgb(var(--background))] flex items-center justify-center flex-shrink-0">
                                              <span className="text-[rgb(var(--primary-foreground))] font-bold">{step.stepNumber}</span>
                                            </div>
                                            <div className="min-w-0 flex-1 py-1.5">
                                              <h5 className="font-semibold text-[rgb(var(--foreground))] text-lg">{step.title}</h5>
                                              <p className="mt-1 text-[rgb(var(--muted-foreground))]">{step.explanation}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                            </div>
                        )}

                        {/* Main Explanation */}
                        <div>
                            <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                                <LightBulbIcon className="w-7 h-7 text-yellow-500" />
                                Ana Açıklama
                            </h4>
                             <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-[rgb(var(--foreground))] whitespace-pre-wrap text-md">{result.mainExplanation}</p>
                            </div>
                        </div>
                        
                        {/* Incorrect Options Analysis */}
                        {result.incorrectOptionsAnalysis && result.incorrectOptionsAnalysis.length > 0 && (
                             <div>
                                <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-4">Yanlış Şıkların Analizi</h4>
                                <div className="space-y-4">
                                    {result.incorrectOptionsAnalysis.map((item, index) => (
                                        <div key={index} className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <XCircleIcon className="w-8 h-8 text-red-500 flex-shrink-0 mt-1" />
                                            <div>
                                                <h5 className="font-semibold text-red-800 dark:text-red-200 text-lg">{item.option}</h5>
                                                <p className="text-red-700 dark:text-red-300">{item.reason}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
};