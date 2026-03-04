import React from 'react';
import type { Tool } from '../../types';

interface ToolIconProps {
  tool: Tool;
  onClick: () => void;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ tool, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="h-full flex flex-col items-center justify-start text-center p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
    >
      <div className="text-5xl mb-3 transition-transform duration-200 group-hover:scale-110">{tool.icon}</div>
      <h3 className="font-semibold text-sm text-black mb-1">{tool.name}</h3>
      <p className="text-xs text-gray-500 leading-normal">{tool.description}</p>
    </button>
  );
};