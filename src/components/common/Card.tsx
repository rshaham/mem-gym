import { type ReactNode, type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  ...props
}: CardProps): JSX.Element {
  return (
    <div
      className={`
        bg-[var(--bg-primary)] rounded-card
        shadow-sm border border-gray-100 dark:border-gray-800
        ${variant === 'interactive' ? 'cursor-pointer active:scale-[0.98] transition-transform duration-fast hover:shadow-md' : ''}
        ${paddingStyles[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
