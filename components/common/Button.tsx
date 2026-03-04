import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[rgb(var(--background))] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform active:scale-95 shadow-sm';
  
  const variantClasses = {
    primary: 'bg-gradient-to-br from-[rgb(var(--primary))] to-[rgb(var(--sky))] text-[rgb(var(--primary-foreground))] hover:brightness-110 focus:ring-[rgb(var(--ring))] shadow-[rgb(var(--primary))]_/_0.2_',
    secondary: 'bg-[rgb(var(--secondary))] text-[rgb(var(--secondary-foreground))] hover:bg-[rgb(var(--accent))] focus:ring-[rgb(var(--ring))]',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};