import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, ...props }: CardProps) {
  return <div data-component="card" {...props}>{children}</div>;
}

export function CardHeader({ children, ...props }: CardProps) {
  return <div data-component="card-header" {...props}>{children}</div>;
}

export function CardBody({ children, ...props }: CardProps) {
  return <div data-component="card-body" {...props}>{children}</div>;
}

export function CardFooter({ children, ...props }: CardProps) {
  return <div data-component="card-footer" {...props}>{children}</div>;
}
