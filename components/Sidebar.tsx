import React, { useState } from 'react';
import type { Tool } from '../types';
import { TOOL_CATEGORIES, NOTEBOOK_TOOL } from '../constants';

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);


interface SidebarProps {
  activeTool: Tool | null;
  onSelectTool: (tool: Tool | null) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool }) => {
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(TOOL_CATEGORIES[0]?.id || null);
  
  const handleCategoryClick = (categoryId: string) => {
    setOpenCategoryId(prev => (prev === categoryId ? null : categoryId));
  };

  return (
    <aside className="w-64 bg-[rgb(var(--card))] flex flex-col transition-all duration-300 border-r border-[rgb(var(--border))]">
      <div className="p-4 border-b border-[rgb(var(--border))] h-16 flex items-center">
        <h1 className="text-2xl font-bold">
            ADA<span className="bg-gradient-to-br from-[rgb(var(--sky))] to-[rgb(var(--violet))] bg-clip-text text-transparent">I</span>
        </h1>
      </div>
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
         <button
            onClick={() => onSelectTool(null)}
            className={`w-full flex items-center p-2.5 rounded-lg text-left transition-colors duration-200 font-semibold ${
              activeTool === null
                ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] shadow-md shadow-[rgba(var(--primary),0.2)]'
                : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
            }`}
          >
            <span className="w-5 text-center mr-3">🏠</span>
            <span>Dashboard</span>
        </button>
        <button
            onClick={() => onSelectTool(NOTEBOOK_TOOL)}
            className={`w-full flex items-center p-2.5 rounded-lg text-left transition-colors duration-200 font-semibold ${
              activeTool?.id === NOTEBOOK_TOOL.id
                ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] shadow-md shadow-[rgba(var(--primary),0.2)]'
                : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
            }`}
          >
            <span className="w-5 text-center mr-3">{NOTEBOOK_TOOL.icon}</span>
            <span>{NOTEBOOK_TOOL.name}</span>
        </button>

        <div className="pt-2 border-t border-[rgb(var(--border))]">
            {TOOL_CATEGORIES.map((category) => (
                <div key={category.id}>
                    <button 
                    onClick={() => handleCategoryClick(category.id)}
                    className="w-full flex justify-between items-center p-2.5 rounded-lg text-left font-semibold text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] transition-colors"
                    aria-expanded={openCategoryId === category.id}
                    >
                    <div className="flex items-center">
                        <span className="mr-3">{category.icon}</span>
                        <span>{category.name}</span>
                    </div>
                    <ChevronDownIcon className={`w-5 h-5 transition-transform duration-200 ${openCategoryId === category.id ? 'rotate-180' : ''}`} />
                    </button>
                    {openCategoryId === category.id && (
                        <ul className="pl-4 pt-1 pb-1 mt-1 space-y-1">
                            {category.tools.map(tool => (
                                <li key={tool.id}>
                                    <button 
                                    onClick={() => onSelectTool(tool)}
                                    className={`w-full flex items-center gap-3 py-2 px-3 rounded-md text-left text-sm transition-colors ${
                                        activeTool?.id === tool.id
                                        ? 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] font-semibold'
                                        : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--muted))] hover:text-[rgb(var(--foreground))]'
                                    }`}
                                    >
                                    <div className="w-5 text-center">{tool.icon}</div>
                                    <span>{tool.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ))}
        </div>
      </nav>
    </aside>
  );
};