import { ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/common/Card';

interface AnalysisSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export const AnalysisSection = ({
  title,
  description,
  children,
}: AnalysisSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};
