import React, { useState, useEffect } from 'react';
import { TOOL_CATEGORIES } from '../constants';
import { Button } from './common/Button';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentActions: string[];
  onSave: (newActions: string[]) => void;
}

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

export const QuickActionsModal: React.FC<QuickActionsModalProps> = ({ isOpen, onClose, currentActions, onSave }) => {
  const [selected, setSelected] = useState<string[]>(currentActions);

  useEffect(() => {
    setSelected(currentActions);
  }, [isOpen, currentActions]);
  
  const handleToggle = (toolId: string) => {
    setSelected(prev => {
      if (prev.includes(toolId)) {
        // Prevent deselecting if it's one of the last two
        if (prev.length <= 2) return prev;
        return prev.filter(id => id !== toolId);
      } else {
        // Prevent selecting more than 6
        if (prev.length >= 6) return prev;
        return [...prev, toolId];
      }
    });
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  const isSelectionValid = selected.length >= 2 && selected.length <= 6;

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300 ease-in-out"
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-[rgb(var(--card))] shadow-xl z-50 rounded-lg"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex justify-between items-center p-4 border-b border-[rgb(var(--border))]">
            <h2 className="text-xl font-bold">Hızlı Eylemleri Düzenle</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-[rgb(var(--muted))]" aria-label="Close modal">
                <CloseIcon className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
            </button>
        </div>
        
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Ana sayfanızda görünmesi için 2 ila 6 arasında araç seçin.</p>
            {TOOL_CATEGORIES.map(category => (
                <div key={category.id}>
                    <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {category.tools.map(tool => {
                            const isChecked = selected.includes(tool.id);
                            return (
                                <label key={tool.id} className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] border-[rgb(var(--primary))]' : 'bg-[rgb(var(--muted))] hover:bg-[rgb(var(--accent))] border-transparent'}`}>
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggle(tool.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-[rgb(var(--primary))] focus:ring-[rgb(var(--ring))] bg-[rgb(var(--card))]"
                                    />
                                    <span>{tool.icon} {tool.name}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
        
        <div className="flex justify-between items-center p-4 border-t border-[rgb(var(--border))]">
            <p className={`text-sm ${isSelectionValid ? 'text-[rgb(var(--muted-foreground))]' : 'text-red-500 font-semibold'}`}>
                {selected.length} / 6 seçili
            </p>
            <div className="flex gap-2">
                <Button variant="secondary" onClick={onClose}>İptal</Button>
                <Button onClick={handleSave} disabled={!isSelectionValid}>Kaydet</Button>
            </div>
        </div>
      </div>
    </>
  );
};
