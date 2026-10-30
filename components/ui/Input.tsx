import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', icon, rightElement, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-zinc-500">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 placeholder-zinc-500 transition-colors focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed',
              icon && 'pl-9',
              rightElement && 'pr-10',
              error && 'border-rose-500 focus:border-rose-500',
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-zinc-500">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
