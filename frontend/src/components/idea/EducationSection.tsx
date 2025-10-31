import { EducationContent } from '@/types';
import { AnalysisSection } from './AnalysisSection';
import { Badge } from '@/components/common/Badge';

interface EducationSectionProps {
  content: EducationContent;
}

export const EducationSectionComponent = ({ content }: EducationSectionProps) => {
  return (
    <AnalysisSection
      title="Product Space Education"
      description="Key terminology and industry overview"
    >
      <div className="space-y-6">
        <div>
          <h4 className="mb-3 font-semibold">Keywords</h4>
          <div className="flex flex-wrap gap-2">
            {content.keywords.map((keyword, idx) => (
              <Badge key={idx} variant="info">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Terminology</h4>
          <dl className="space-y-3">
            {Object.entries(content.terminology).map(([term, definition]) => (
              <div key={term}>
                <dt className="font-medium text-text-primary">{term}</dt>
                <dd className="mt-1 text-sm text-text-secondary">{definition}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Industry Overview</h4>
          <p className="text-text-secondary">{content.industryOverview}</p>
        </div>
      </div>
    </AnalysisSection>
  );
};
