import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-500/20 text-gray-400',
  success: 'bg-green-500/20 text-green-400',
  warning: 'bg-yellow-500/20 text-yellow-400',
  danger: 'bg-red-500/20 text-red-400',
  info: 'bg-blue-500/20 text-blue-400',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `.trim()}
    >
      {children}
    </span>
  );
}

// Pre-configured status badges
export function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    backlog: { variant: 'default', label: 'Backlog' },
    in_progress: { variant: 'info', label: 'In Progress' },
    review: { variant: 'warning', label: 'Review' },
    done: { variant: 'success', label: 'Done' },
    blocked: { variant: 'danger', label: 'Blocked' },
  };

  const { variant, label } = config[status] || { variant: 'default', label: status };
  return <Badge variant={variant}>{label}</Badge>;
}
