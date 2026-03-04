import React, { useState } from 'react';
import { TOOL_CATEGORIES, NOTEBOOK_TOOL } from '../constants';
import type { Tool } from '../types';

const CloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: Tool | null) => void;
}

export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose, onSelectTool }) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setOpenCategoryId(prev => (prev === categoryId ? null : categoryId));
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-slate-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="menu-heading"
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 h-16">
            <h1 id="menu-heading" className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                ADA<span className="bg-gradient-to-br from-sky-500 to-blue-500 bg-clip-text text-transparent">I</span>
            </h1>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Close menu">
            <CloseIcon className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          </button>
        </div>
        
        <nav className="p-3 space-y-2 overflow-y-auto h-[calc(100vh-64px)]">
          <button 
            onClick={() => onSelectTool(null)} 
            className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-xl w-6 text-center flex-shrink-0">🏠</span>
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => onSelectTool(NOTEBOOK_TOOL)} 
            className="w-full flex items-center gap-3 p-2.5 rounded-lg text-left font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
             <span className="text-xl w-6 text-center flex-shrink-0">{NOTEBOOK_TOOL.icon}</span>
             <span>{NOTEBOOK_TOOL.name}</span>
          </button>
            
          <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700" />

            {TOOL_CATEGORIES.map((category) => (
              <div key={category.id}>
                <button 
                  onClick={() => handleCategoryClick(category.id)}
                  className="w-full flex justify-between items-center p-2.5 rounded-lg text-left font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-expanded={openCategoryId === category.id}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-6 text-center">{category.icon}</span>
                    <span className="flex-1">{category.name}</span>
                  </div>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${openCategoryId === category.id ? 'rotate-180' : ''}`} />
                </button>
                {openCategoryId === category.id && (
                  <ul className="pl-5 pt-1 pb-1 mt-1 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 ml-5">
                    {category.tools.map(tool => (
                      <li key={tool.id}>
                        <button 
                          onClick={() => onSelectTool(tool)}
                          className="w-full flex items-center gap-3 py-2 px-3 rounded-md text-left text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                        >
                          <span className="text-xl w-6 text-center">{tool.icon}</span>
                          <span>{tool.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
        </nav>
      </div>
    </>
  );
};