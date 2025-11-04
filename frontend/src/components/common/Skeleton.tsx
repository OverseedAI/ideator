import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "title" | "card" | "circle";
}

export const Skeleton = ({ variant = "text", className, ...props }: SkeletonProps) => {
  const variants = {
    text: "h-4 w-full",
    title: "h-8 w-3/4",
    card: "h-48 w-full",
    circle: "h-12 w-12 rounded-full",
  };

  return (
    <div
      className={cn("animate-pulse rounded bg-gray-200", variants[variant], className)}
      {...props}
    />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <Skeleton variant="title" className="mb-4" />
      <div className="space-y-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-4/6" />
      </div>
    </div>
  );
};
