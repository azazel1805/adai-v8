import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'interactive';
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default', ...props }) => {
  const baseClasses = 'bg-[rgb(var(--card))] text-[rgb(var(--card-foreground))] border border-[rgb(var(--border))] rounded-xl shadow-sm';
  
  const variantClasses = {
    default: 'p-6',
    interactive: 'p-6 transition-all duration-300 ease-out hover:transform hover:-translate-y-1 hover:shadow-xl hover:shadow-[rgba(var(--primary),0.1)] dark:hover:shadow-[rgba(var(--primary),0.15)] cursor-pointer',
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};