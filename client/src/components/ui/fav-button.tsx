"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FavButtonProps {
  isFav: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FavButton({
  isFav,
  onClick,
  className,
  size = "md",
}: FavButtonProps) {
  const sizeClasses = {
    sm: "p-2",
    md: "p-2.5",
    lg: "p-3",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-5.5 w-5.5",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.85 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full backdrop-blur-md transition-all border shadow-sm cursor-pointer select-none",
        isFav
          ? "bg-brand-coral/20 border-brand-coral/40 text-brand-coral"
          : "bg-black/40 border-white/10 text-white/80 hover:bg-black/60",
        sizeClasses[size],
        className
      )}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart className={cn(iconSizes[size], isFav && "fill-brand-coral text-brand-coral")} />
    </motion.button>
  );
}
