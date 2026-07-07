import * as React from "react";

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
}

export function Spinner({ size = "md", className = "", ...props }: SpinnerProps) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-transparent border-zinc-900 dark:border-zinc-50 ${sizes[size]} ${className}`}
      style={{ borderLeftColor: "transparent" }}
      {...props}
    />
  );
}
