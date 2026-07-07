import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cyan" | "yellow" | "dark" | "white" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", children, ...props }, ref) => {
    // Base styles with smooth claymorphic transition and rounded corners matching design radius (12px)
    const baseStyles = 
      "inline-flex items-center justify-center rounded-clay-md font-semibold transition-all duration-150 " +
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none " +
      "disabled:opacity-50 active:shadow-clay-active active:translate-y-[2px] cursor-pointer select-none";

    const variants = {
      // Map 'primary' to standard Cyan Claymorphic button
      primary: "bg-brand-cyan text-brand-white shadow-clay-cyan hover:scale-[1.02] border-0",
      
      // Map 'secondary' to White Claymorphic button
      secondary: "bg-brand-white text-ink border border-hairline shadow-clay-white hover:scale-[1.02]",
      
      // Explicit clay variations
      cyan: "bg-brand-cyan text-brand-white shadow-clay-cyan hover:scale-[1.02] border-0",
      yellow: "bg-brand-yellow text-ink shadow-clay-yellow hover:scale-[1.02] border-0",
      dark: "bg-primary-cta text-brand-white shadow-clay-dark hover:scale-[1.02] border-0",
      white: "bg-brand-white text-ink border border-hairline shadow-clay-white hover:scale-[1.02]",
      
      ghost: "hover:bg-surface-soft text-ink bg-transparent",
    };

    const sizes = {
      sm: "h-9 px-4 text-xs",
      md: "h-11 px-5 text-sm",
      lg: "h-12 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
