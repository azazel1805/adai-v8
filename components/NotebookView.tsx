import React, { useState, useEffect, useRef } from 'react';
import { useNotebook } from '../hooks/useNotebook';
import { Card } from './common/Card';
import { Button } from './common/Button';
import type { TenseExplanation, AcademicGrammarExplanation, SavedWord, SavedTranslation, SavedEssay, SavedRephrasing } from '../types';
import { TOOL_CATEGORIES, NOTEBOOK_TOOL } from '../constants';

type Tab = 'notes' | 'vocabulary' | 'tenses' | 'grammar' | 'essays' | 'translations' | 'rephrasings';

// --- ICONS ---
const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /> </svg> );
const SpeakerWaveIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" /> </svg> );
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>);
const NotesIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>);
const VocabIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v8.25A2.25 2.25 0 006 16.5h2.25m8.25-8.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-7.5A2.25 2.25 0 018.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 00-2.25 2.25v6" /></svg>);
const TensesIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
const GrammarIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V5.625A2.25 2.25 0 0016.5 3.375h-9a2.25 2.25 0 00-2.25 2.25V15" /></svg>);
const EssaysIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>);
const TranslateIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.62_3.282 3.282-5.25 11.62_1.62-3.72M3.75 6.75h16.5M16.5 19.5h-15" /></svg>);
const RephraseIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0011.667 0l3.181-3.183m-4.991-2.691v4.992h-4.992v-4.992z" /></svg>);
const EmptyBoxIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.12-1.588H6.88a2.25 2.25 0 00-2.12 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" /> </svg>);
const ArrowUturnLeftIcon = (props: React.SVGProps<SVGSVGElement>) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}> <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /> </svg>);
// --- END ICONS ---

// --- RICH TEXT EDITOR ICONS ---
const BoldIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="1em" width="1em" {...props}><path d="M7 4h6a4 4 0 0 1 4 4 4 4 0 0 1-4 4H7V4zm3 3v6h3a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-3z"></path></svg>);
const ItalicIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" {...props}><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>);
const UnderlineIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" {...props}><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>);
const ULIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" {...props}><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>);
const OLIcon = (props: React.SVGProps<SVGSVGElement>) => (<svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" {...props}><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 1-2 2-3s-1-1.5-2-1"></path></svg>);

const EmptyState: React.FC<{ title: string; description: string; icon: React.ReactNode; cta?: React.ReactNode }> = ({ title, description, icon, cta }) => (
    <div className="text-center py-12 px-6 text-[rgb(var(--muted-foreground))] flex flex-col items-center justify-center h-full">
        <div className="w-24 h-24 text-[rgb(var(--border))]">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-[rgb(var(--foreground))] mt-4">{title}</h3>
        <p className="mt-2 max-w-sm">{description}</p>
        {cta && <div className="mt-6">{cta}</div>}
    </div>
);

const EditorToolbar: React.FC<{ onFormat: (cmd: string) => void }> = ({ onFormat }) => {
    const buttons = [
        { cmd: 'bold', icon: <BoldIcon className="w-5 h-5" /> },
        { cmd: 'italic', icon: <ItalicIcon className="w-5 h-5" /> },
        { cmd: 'underline', icon: <UnderlineIcon className="w-5 h-5" /> },
        { cmd: 'insertUnorderedList', icon: <ULIcon className="w-5 h-5" /> },
        { cmd: 'insertOrderedList', icon: <OLIcon className="w-5 h-5" /> },
    ];
    return (
        <div className="flex items-center gap-1 p-2 border-b border-[rgb(var(--border))] bg-[rgb(var(--muted))] rounded-t-lg">
            {buttons.map(({ cmd, icon }) => (
                <button
                    key={cmd}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); onFormat(cmd); }}
                    className="p-2 rounded hover:bg-[rgb(var(--accent))] text-[rgb(var(--accent-foreground))]"
                    title={cmd}
                >
                    {icon}
                </button>
            ))}
        </div>
    );
};


export const NotebookView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('notes');
    const { notebookData, updateNotes, removeWord, removeTense, removeAcademicGrammar, removeEssay, removeTranslation, removeRephrasing } = useNotebook();
    const [isNoteSaved, setIsNoteSaved] = useState(false);
    const timeoutRef = useRef<number | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const setActiveTool = (toolId: string) => {
        const allTools = TOOL_CATEGORIES.flatMap(cat => cat.tools).concat(NOTEBOOK_TOOL);
        const tool = allTools.find(t => t.id === toolId);
        // This is a simplified way to navigate. In a real app with a router, you'd use that.
        // For now, we'll just log it. A proper implementation would need a callback from App.tsx
        console.log("Navigate to:", tool);
    };

    const TABS: { id: Tab; name: string; icon: React.ReactNode; count: number; ctaToolId?: string; }[] = [
        { id: 'notes', name: 'Genel Notlar', icon: <NotesIcon className="w-5 h-5" />, count: notebookData.notes.length > 0 ? 1 : 0 },
        { id: 'vocabulary', name: 'Kelime Listesi', icon: <VocabIcon className="w-5 h-5" />, count: notebookData.vocabulary.length, ctaToolId: 'dictionary' },
        { id: 'tenses', name: 'Zamanlar', icon: <TensesIcon className="w-5 h-5" />, count: notebookData.tenses.length, ctaToolId: 'tenses-module' },
        { id: 'grammar', name: 'Akademik Gramer', icon: <GrammarIcon className="w-5 h-5" />, count: notebookData.academicGrammar.length, ctaToolId: 'academic-grammar-module' },
        { id: 'essays', name: 'Essay\'ler', icon: <EssaysIcon className="w-5 h-5" />, count: notebookData.essays.length, ctaToolId: 'essay-helper' },
        { id: 'translations', name: 'Çevirilerim', icon: <TranslateIcon className="w-5 h-5" />, count: notebookData.translations.length, ctaToolId: 'detailed-translator' },
        { id: 'rephrasings', name: 'Çeşitlemeler', icon: <RephraseIcon className="w-5 h-5" />, count: notebookData.rephrasings.length, ctaToolId: 'sentence-rephraser' },
    ];

    useEffect(() => {
        if (activeTab === 'notes' && editorRef.current) {
            if (editorRef.current.innerHTML !== notebookData.notes) {
                editorRef.current.innerHTML = notebookData.notes;
            }
        }
    }, [activeTab, notebookData.notes]);

    const handleNotesInput = (e: React.FormEvent<HTMLDivElement>) => {
        const currentHtml = e.currentTarget.innerHTML;
        setIsNoteSaved(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = window.setTimeout(() => {
            updateNotes(currentHtml);
            setIsNoteSaved(true);
            setTimeout(() => setIsNoteSaved(false), 2000);
        }, 1500);
    };
    
    const handleFormat = (command: string) => {
        document.execCommand(command, false);
        editorRef.current?.focus();
        if (editorRef.current) {
             const event = new Event('input', { bubbles: true, cancelable: true });
             editorRef.current.dispatchEvent(event);
        }
    };

    const renderContent = () => {
        const currentTabInfo = TABS.find(t => t.id === activeTab);
        
        switch(activeTab) {
            case 'notes': return (
                 <div className="relative h-full">
                    <style>{`
                        .rich-text-editor[contenteditable]:empty:before {
                            content: attr(data-placeholder);
                            color: rgb(var(--muted-foreground));
                            pointer-events: none;
                        }
                    `}</style>
                    <div className="border border-[rgb(var(--border))] rounded-lg bg-[rgb(var(--card))] focus-within:ring-2 focus-within:ring-[rgb(var(--ring))] overflow-hidden shadow-sm h-full flex flex-col">
                        <EditorToolbar onFormat={handleFormat} />
                        <div
                            ref={editorRef}
                            onInput={handleNotesInput}
                            contentEditable
                            suppressContentEditableWarning
                            className="rich-text-editor w-full flex-1 p-4 outline-none overflow-y-auto prose dark:prose-invert max-w-none"
                            data-placeholder="Genel notlarınızı buraya yazın..."
                        />
                    </div>
                    <div className={`absolute bottom-3 right-3 transition-opacity duration-300 ${isNoteSaved ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="text-xs bg-[rgb(var(--foreground))] text-[rgb(var(--background))] px-2 py-1 rounded-md">Kaydedildi</span>
                    </div>
                </div>
            );
            case 'vocabulary': 
                if (notebookData.vocabulary.length === 0) return <EmptyState title="Kelime Listeniz Boş" description="Sözlük'ten kelime aratıp kaydederek başlayabilirsiniz." icon={<VocabIcon />} cta={<Button onClick={() => setActiveTool(currentTabInfo!.ctaToolId!)}>Sözlüğe Git</Button>} />;
                return (
                    <div className="space-y-4">
                        {notebookData.vocabulary.map(word => <VocabularyCard key={word.id} savedWord={word} onRemove={() => removeWord(word.id)} />)}
                    </div>
                );
            case 'tenses':
                if (notebookData.tenses.length === 0) return <EmptyState title="Kaydedilmiş Zaman Yok" description="Zamanlar Modülü'nden konuları inceleyip kaydedebilirsiniz." icon={<TensesIcon />} cta={<Button onClick={() => setActiveTool(currentTabInfo!.ctaToolId!)}>Zamanlar Modülüne Git</Button>} />;
                return (
                    <div className="space-y-4">
                        {notebookData.tenses.map(tense => <ExplanationCard key={tense.tenseName} item={tense} onRemove={() => removeTense(tense.tenseName)}/>)}
                    </div>
                );
            case 'grammar':
                if (notebookData.academicGrammar.length === 0) return <EmptyState title="Kaydedilmiş Konu Yok" description="Akademik Gramer modülünden konuları çalışıp kaydedebilirsiniz." icon={<GrammarIcon />} cta={<Button onClick={() => setActiveTool(currentTabInfo!.ctaToolId!)}>Akademik Gramere Git</Button>} />;
                return (
                    <div className="space-y-4">
                        {notebookData.academicGrammar.map(grammar => <ExplanationCard key={grammar.topicName} item={grammar} onRemove={() => removeAcademicGrammar(grammar.topicName)} />)}
                    </div>
                );
            case 'essays':
                if (notebookData.essays.length === 0) return <EmptyState title="Kaydedilmiş Essay Yok" description="Essay Yardımcısı'nı kullanarak bir essay oluşturup kaydedebilirsiniz." icon={<EssaysIcon />} cta={<Button onClick={() => setActiveTool(currentTabInfo!.ctaToolId!)}>Essay Yardımcısına Git</Button>} />;
                return (
                    <div className="space-y-4">
                        {notebookData.essays.map(essay => (
                            <ExpandableCard key={essay.id} title={essay.topic} onRemove={() => removeEssay(essay.id)}>
                                <p className="whitespace-pre-wrap">{essay.content}</p>
                            </ExpandableCard>
                        ))}
                    </div>
                );
             case 'translations':
                if (notebookData.translations.length === 0) return <EmptyState title="Kaydedilmiş Çeviri Yok" description="Detaylı Çevirmen'i kullanarak çeviriler yapıp kaydedebilirsiniz." icon={<TranslateIcon />} cta={<Button onClick={() => setActiveTool(currentTabInfo!.ctaToolId!)}>Çevirmene Git</Button>} />;
                return (
                    <div className="space-y-4">
                        {notebookData.translations.map(translation => ( <TranslationCard key={translation.id} savedTranslation={translation} onRemove={() => removeTranslation(translation.id)} /> ))}
                    </div>
                );
            case 'rephrasings':
                if (notebookData.rephrasings.length === 0) return <EmptyState title="Kaydedilmiş Çeşitleme Yok" description="Cümle Yeniden Yazıcı'yı kullanarak cümlelerinizi çeşitlendirip kaydedebilirsiniz." icon={<RephraseIcon />} cta={<Button onClick={() => setActiveTool(currentTabInfo!.ctaToolId!)}>Yeniden Yazıcıya Git</Button>} />;
                return (
                    <div className="space-y-4">
                        {notebookData.rephrasings.map(item => (
                            <ExpandableCard key={item.id} title={item.original} onRemove={() => removeRephrasing(item.id)}>
                                <div className="space-y-3">
                                    {item.rephrasings.map((rephrase, index) => (
                                        <div key={index} className="p-3 bg-[rgb(var(--muted))] rounded-md">
                                            <h5 className="font-semibold text-[rgb(var(--foreground))]">{rephrase.style}</h5>
                                            <p className="text-[rgb(var(--muted-foreground))]">{rephrase.sentence}</p>
                                        </div>
                                    ))}
                                </div>
                            </ExpandableCard>
                        ))}
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 h-full">
            <aside className="w-full md:w-1/4 lg:w-1/5 flex-shrink-0">
                <Card className="p-3">
                    <nav className="space-y-1">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-md text-left text-sm font-semibold transition-colors ${
                                    activeTab === tab.id ? 'bg-gradient-to-r from-[rgb(var(--sky))] to-[rgb(var(--blue))] text-white shadow' : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))]'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {tab.icon}
                                    <span>{tab.name}</span>
                                </div>
                                {tab.count > 0 && <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-white/20' : 'bg-[rgb(var(--border))] text-[rgb(var(--foreground))]'}`}>{tab.count}</span>}
                            </button>
                        ))}
                    </nav>
                </Card>
            </aside>
            <main className="flex-1 min-h-0">
                {renderContent()}
            </main>
        </div>
    );
};

const VocabularyCard: React.FC<{ savedWord: SavedWord; onRemove: () => void }> = ({ savedWord, onRemove }) => {
    const { word, details, imageUrl } = savedWord;
    const [isAudioLoading, setIsAudioLoading] = useState(false);

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
    
    return (
        <Card className="!p-0 overflow-hidden">
            <div className="grid md:grid-cols-3">
                <div className="md:col-span-1">
                    {imageUrl ? 
                        <img src={imageUrl} alt={word} className="w-full h-full object-cover min-h-[200px]" /> :
                        <div className="w-full h-full bg-[rgb(var(--muted))] flex items-center justify-center min-h-[200px]">
                            <EmptyBoxIcon className="w-16 h-16 text-[rgb(var(--border))]"/>
                        </div>
                    }
                </div>
                <div className="md:col-span-2 p-6 relative">
                    <Button variant="secondary" onClick={onRemove} className="!p-2 h-auto absolute top-4 right-4">
                        <TrashIcon className="w-5 h-5" />
                    </Button>
                    <h3 className="text-3xl font-bold capitalize text-[rgb(var(--foreground))] mb-1">{word}</h3>
                    <div className="flex items-center gap-2 text-lg text-[rgb(var(--muted-foreground))] mb-6">
                        <span>{details.pronunciation}</span>
                        <button onClick={playPronunciation} disabled={isAudioLoading} className="p-1 hover:text-[rgb(var(--primary))] disabled:opacity-50 transition-colors">
                            {isAudioLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div> : <SpeakerWaveIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">Meanings</h4>
                            <ul className="list-disc list-inside space-y-1 pl-2 text-[rgb(var(--muted-foreground))]">
                                {details.definitions.map((def, i) => <li key={i}><strong>{def.english}</strong> ({def.turkish})</li>)}
                            </ul>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">Synonyms</h4>
                                <p className="italic text-[rgb(var(--muted-foreground))]">{details.synonyms.english.join(', ') || 'N/A'}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">Antonyms</h4>
                                <p className="italic text-[rgb(var(--muted-foreground))]">{details.antonyms.english.join(', ') || 'N/A'}</p>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[rgb(var(--foreground))] mb-1">Etymology</h4>
                            <p className="text-[rgb(var(--muted-foreground))]">{details.etymology}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const ExpandableCard: React.FC<{title: string; onRemove: () => void; children: React.ReactNode}> = ({ title, onRemove, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <Card className="overflow-hidden !p-0">
            <div className="flex justify-between items-center cursor-pointer p-4" onClick={() => setIsOpen(!isOpen)}>
                <h3 className="text-lg font-bold capitalize text-[rgb(var(--foreground))]">{title}</h3>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={(e) => { e.stopPropagation(); onRemove(); }} className="!p-2 h-auto">
                        <TrashIcon className="w-5 h-5" />
                    </Button>
                    <span className="p-1">
                        <ChevronDownIcon className={`w-6 h-6 transform transition-transform text-[rgb(var(--muted-foreground))] ${isOpen ? 'rotate-180' : ''}`} />
                    </span>
                </div>
            </div>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                 <div className="prose dark:prose-invert max-w-none p-4 border-t border-[rgb(var(--border))]">
                  {children}
                </div>
            </div>
        </Card>
    );
};

const ExplanationCard: React.FC<{ item: TenseExplanation | AcademicGrammarExplanation; onRemove: () => void }> = ({ item, onRemove }) => {
    const isTense = 'tenseName' in item;
    const title = isTense ? item.tenseName : item.topicName;

    return (
        <ExpandableCard title={title} onRemove={onRemove}>
            {isTense ? (
                <div>
                    <h4 className="font-semibold text-lg mb-2">Structure</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded"><strong className="text-green-700 dark:text-green-300">Positive:</strong> {item.structure.positive}</div>
                        <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded"><strong className="text-red-700 dark:text-red-300">Negative:</strong> {item.structure.negative}</div>
                        <div className="p-2 bg-sky-50 dark:bg-sky-900/30 rounded"><strong className="text-sky-700 dark:text-sky-300">Question:</strong> {item.structure.question}</div>
                    </div>
                </div>
            ) : ( 
                <div>
                     <h4 className="font-semibold text-lg mb-2">Explanation</h4>
                     <p>{item.explanation}</p>
                </div>
            )}
            <h4 className="font-semibold text-lg mt-4 mb-2">Usage</h4>
            <div className="space-y-2">
            {item.usage.map((use, index) => (
                <div key={index} className="p-3 bg-[rgb(var(--muted))] rounded-md not-prose">
                    <p className="font-semibold text-base">{use.use}</p>
                    <p className="italic">"{use.example}"</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">({use.translation})</p>
                </div>
            ))}
            </div>
        </ExpandableCard>
    );
};

const TranslationCard: React.FC<{ savedTranslation: SavedTranslation; onRemove: () => void }> = ({ savedTranslation, onRemove }) => {
    const { id, translationData, imageUrl } = savedTranslation;

    return (
        <ExpandableCard title={`"${id}"`} onRemove={onRemove}>
             <div className="space-y-6">
                {imageUrl && (
                    <div className="mb-6">
                        <img src={imageUrl} alt={translationData.imageQueryKeyword} className="rounded-lg object-cover w-full h-auto max-h-80 shadow-md" />
                    </div>
                )}
                
                <div>
                    <h4 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-1">Direct Translation</h4>
                    <p className="p-3 bg-[rgb(var(--muted))] rounded-md">{translationData.directTranslation}</p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-1">Grammar Analysis</h4>
                    <p className="p-3 bg-[rgb(var(--muted))] rounded-md whitespace-pre-wrap">{translationData.grammarAnalysis}</p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-1">Translation Rationale</h4>
                    <p className="p-3 bg-[rgb(var(--muted))] rounded-md whitespace-pre-wrap">{translationData.translationRationale}</p>
                </div>

                <div>
                    <h4 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-1">Alternative Translations</h4>
                    <div className="space-y-3">
                        {translationData.alternatives.map((alt, index) => (
                            <div key={index} className="border-l-4 border-[rgb(var(--primary))] pl-3">
                                <p className="font-semibold">{alt.translation}</p>
                                <p className="text-sm text-[rgb(var(--muted-foreground))]">{alt.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ExpandableCard>
    );
};
