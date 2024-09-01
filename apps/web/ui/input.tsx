"use client";
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { 
    label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, label, ...rest }, ref) => {
    return (
        <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
                ref={ref}
                className={cn('p-2 rounded-lg border-stone-200 border-[1.5px]', className)}
                {...rest}
            />
        </div>
    );
});

export default Input;