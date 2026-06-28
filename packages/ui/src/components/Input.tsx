import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, id, ...props }: InputProps) {
  return (
    <div data-component="input-wrapper">
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} aria-invalid={!!error} {...props} />
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
