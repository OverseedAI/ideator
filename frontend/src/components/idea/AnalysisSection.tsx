import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';

interface AnalysisSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export const AnalysisSection = ({
  title,
  description,
  icon,
  children,
}: AnalysisSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle icon={icon}>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
