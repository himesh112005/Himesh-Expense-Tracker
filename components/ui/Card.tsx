import React from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'emerald' | 'indigo' | 'rose' | 'amber' | 'none';
}

export function Card({ className, glow = 'none', children, ...props }: CardProps) {
  const glowStyles = {
    none: '',
    emerald: 'hover:border-emerald-500/30 hover:shadow-fintech-glow-emerald',
    indigo: 'hover:border-indigo-500/30 hover:shadow-fintech-glow-indigo',
    rose: 'hover:border-rose-500/30 hover:shadow-fintech-glow-rose',
    amber: 'hover:border-amber-500/30',
  };

  return (
    <div
      className={cn(
        'bg-panel rounded-xl border border-panelBorder shadow-fintech-card transition-all duration-150 ease-out',
        glowStyles[glow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5 border-b border-panelBorder/60 flex items-center justify-between', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-sm font-semibold text-slate-200 tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}
