"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * Button variants for different use cases
 */
type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

/**
 * Variant-specific styles using Tailwind classes
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
  danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
};

/**
 * Reusable Button component with variants and loading state.
 *
 * Uses forwardRef to allow ref forwarding for form libraries and focus management.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      isLoading = false,
      className = "",
      disabled,
      children,
      ...props
    },
    ref
  ) {
    const baseStyles =
      "inline-flex items-center justify-center px-4 py-2 rounded-md font-medium cursor-pointer " +
      "transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 " +
      "disabled:opacity-50 disabled:cursor-not-allowed";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" aria-hidden="true" />
        )}
        {children}
      </button>
    );
  }
);
