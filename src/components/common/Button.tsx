import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent-primary text-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300',
  secondary:
    'bg-transparent border-2 border-accent-primary text-accent-primary hover:bg-blue-50 active:bg-blue-100 disabled:border-gray-300 disabled:text-gray-300',
  ghost:
    'bg-transparent text-[var(--text-primary)] hover:bg-gray-100 active:bg-gray-200 disabled:text-gray-300',
  danger:
    'bg-accent-error text-white hover:bg-red-600 active:bg-red-700 disabled:bg-gray-300',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-touch',
  lg: 'px-6 py-3 text-lg min-h-touch-comfortable',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        transition-all duration-fast
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        active:scale-[0.98]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
