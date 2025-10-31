import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Card = ({ children, className, ...props }: CardProps) => {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface p-6 shadow-card transition-shadow hover:shadow-elevated',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3 className={cn('text-xl font-semibold', className)} {...props}>
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
    <p className={cn('text-sm text-text-secondary mt-1', className)} {...props}>
      {children}
    </p>
  );
};

export const CardContent = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
};
