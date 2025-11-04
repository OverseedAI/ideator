import { EducationContent } from '@/types';
import { AnalysisSection } from './AnalysisSection';
import { Badge } from '@/components/common/Badge';
import { GraduationCap } from 'lucide-react';

interface EducationSectionProps {
  content: EducationContent;
}

export const EducationSectionComponent = ({ content }: EducationSectionProps) => {
  return (
    <AnalysisSection
      title="Product Space Education"
      description="Key terminology and industry overview"
      icon={<GraduationCap size={28} />}
    >
      <div className="space-y-6">
        <div>
          <h4 className="mb-3">Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {content.keywords.map((keyword, idx) => (
              <Badge key={idx} variant="info">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3">Terminology</h4>
          <dl className="grid gap-4 lg:grid-cols-2">
            {Object.entries(content.terminology).map(([term, definition]) => (
              <div key={term} className="space-y-1">
                <dt className="font-medium text-text-primary">{term}</dt>
                <dd className="text-text-secondary">{definition}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h4 className="mb-3">Industry Overview</h4>
          <p className="text-text-secondary">{content.industryOverview}</p>
        </div>
      </div>
    </AnalysisSection>
  );
};
