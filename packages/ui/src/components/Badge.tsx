import React from 'react';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span data-component="badge" data-variant={variant} {...props}>
      {children}
    </span>
  );
}
