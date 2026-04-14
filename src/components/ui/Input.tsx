"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

/**
 * Reusable Input component with label and error display.
 *
 * Styled consistently with the application design.
 * Error state adds visual feedback with red border and message.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = "", id, ...props },
  ref
) {
  // Generate a stable unique ID for label association
  const generatedId = useId();
  const inputId = id || generatedId;

  const baseStyles =
    "block w-full px-3 py-2 border rounded-md shadow-sm " +
    "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 " +
    "transition-colors duration-200";

  const normalStyles =
    "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
  const errorStyles = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`${baseStyles} ${
          error ? errorStyles : normalStyles
        } ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
});
