import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'cookie';
}

const Button = forwardRef<HTMLInputElement, InputProps>(({ className, variant, ...rest }, ref) => {
  const cookieStyles = {
    color: '#ffffff',
    fontWeight: '600',
    backgroundImage: `
      radial-gradient(circle at 5% 20%, #8B4513 5%, transparent 0),
      radial-gradient(circle at 20% 80%, #8B4513 4%, transparent 0),
      radial-gradient(circle at 40% 30%, #8B4513 5%, transparent 0),
      radial-gradient(circle at 70% 60%, #8B4513 5%, transparent 0),              
      radial-gradient(circle at 50% 90%, #8B4513 3%, transparent 0),   
      radial-gradient(circle at 80% 0%, #8B4513 5%, transparent 0),
      radial-gradient(circle at 100% 50%, #8B4513 4%, transparent 0)
    `,
    backgroundSize: '100% 100%',
    textShadow: '1px 0px 6px rgba(170, 170, 170, 0.6)', // Add shadow to make text more visible
  };
  const cookieTwStyles = "bg-[#f5b31b] hover:bg-[#dca118]";
  return (
    <button
      className={cn('p-2 rounded-lg', className, !variant || variant === 'primary' && "border-stone-200 border-[1.5px]", variant === "cookie" && cookieTwStyles)}
      {...rest}
      {...(variant ? { style: cookieStyles } : {})}
    >
      {rest.children}
    </button >
  );
});

export default Button;