import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  children: ReactNode;
}

export const Badge = ({ variant = "default", children, className, ...props }: BadgeProps) => {
  const variants = {
    default: "bg-secondary/10 text-secondary",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
