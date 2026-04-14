"use client";

import { SelectHTMLAttributes, forwardRef, useId } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

/**
 * Reusable Select component with label and error display.
 *
 * Takes an array of options for consistent API.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, error, options, className = "", id, ...props },
    ref
  ) {
    // Generate a stable unique ID for label association
    const generatedId = useId();
    const selectId = id || generatedId;

    const baseStyles =
      "block w-full px-3 py-2 border rounded-md shadow-sm " +
      "bg-white focus:outline-none focus:ring-2 focus:ring-offset-0 " +
      "transition-colors duration-200";

    const normalStyles =
      "border-gray-300 focus:ring-blue-500 focus:border-blue-500";
    const errorStyles =
      "border-red-500 focus:ring-red-500 focus:border-red-500";

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`${baseStyles} ${
            error ? errorStyles : normalStyles
          } ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p
            id={`${selectId}-error`}
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
