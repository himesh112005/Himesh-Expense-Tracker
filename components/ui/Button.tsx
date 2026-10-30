'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none rounded-lg text-xs';

    const variants = {
      primary:
        'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold',
      secondary:
        'bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 text-zinc-200 border border-zinc-800',
      outline:
        'bg-transparent hover:bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700',
      danger:
        'bg-rose-600 hover:bg-rose-500 text-white font-semibold',
      ghost:
        'bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200',
    };

    const sizes = {
      sm: 'h-8 px-2.5 text-xs gap-1.5',
      md: 'h-9 px-3.5 text-xs gap-2',
      lg: 'h-10 px-4 text-sm gap-2.5',
      icon: 'h-9 w-9 p-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? <span>Loading...</span> : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
