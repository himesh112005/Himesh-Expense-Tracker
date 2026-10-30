import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'emerald' | 'rose' | 'amber';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'sm', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-zinc-900 text-zinc-300 border-zinc-800',
    emerald: 'bg-emerald-950/40 text-emerald-400 border-emerald-800',
    rose: 'bg-rose-950/40 text-rose-300 border-rose-800',
    amber: 'bg-amber-950/40 text-amber-300 border-amber-800',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border tracking-tight tabular-nums select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
