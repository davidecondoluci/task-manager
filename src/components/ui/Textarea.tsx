"use client";

import { TextareaHTMLAttributes, forwardRef, useId } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/**
 * Reusable Textarea component with label and error display.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, className = "", id, ...props }, ref) {
    // Generate a stable unique ID for label association
    const generatedId = useId();
    const textareaId = id || generatedId;

    const baseStyles =
      "block w-full px-3 py-2 border rounded-md shadow-sm " +
      "placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 " +
      "transition-colors duration-200 resize-y min-h-[100px]";

    const normalStyles =
      "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
    const errorStyles =
      "border-red-500 focus:ring-red-500 focus:border-red-500";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`${baseStyles} ${
            error ? errorStyles : normalStyles
          } ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
