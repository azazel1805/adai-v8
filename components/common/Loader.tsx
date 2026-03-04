import React from 'react';

interface LoaderProps {
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text = "Lütfen bekleyin..." }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="flex items-center justify-center space-x-2">
        <div className="w-3 h-3 bg-[rgb(var(--muted-foreground))] rounded-full animate-[pulse-dot_1.4s_ease-in-out_infinite]"></div>
        <div className="w-3 h-3 bg-[rgb(var(--muted-foreground))] rounded-full animate-[pulse-dot_1.4s_ease-in-out_0.2s_infinite]"></div>
        <div className="w-3 h-3 bg-[rgb(var(--muted-foreground))] rounded-full animate-[pulse-dot_1.4s_ease-in-out_0.4s_infinite]"></div>
      </div>
      <p className="text-[rgb(var(--muted-foreground))]">{text}</p>
    </div>
  );
};