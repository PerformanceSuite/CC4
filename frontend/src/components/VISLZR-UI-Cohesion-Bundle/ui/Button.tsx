import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-cc-accent hover:bg-cc-accent/80 text-white',
  secondary: 'bg-cc-bg border border-cc-border hover:bg-cc-border text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  ghost: 'hover:bg-cc-border text-gray-400 hover:text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2',
  lg: 'px-6 py-3 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        rounded-lg transition-colors
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
