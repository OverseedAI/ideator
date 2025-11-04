import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-6 shadow-card transition-shadow hover:shadow-elevated",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
};

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  icon?: ReactNode;
}

export const CardTitle = ({ children, icon, className, ...props }: CardTitleProps) => {
  return (
    <h3 className={cn("text-2xl font-semibold flex items-center gap-3", className)} {...props}>
      {icon && <span className="text-primary">{icon}</span>}
      {children}
    </h3>
  );
};

export const CardDescription = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={cn("text-base text-text-secondary mt-2", className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
};
