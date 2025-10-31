import { SwotContent } from '@/types';
import { AnalysisSection } from './AnalysisSection';

interface SwotSectionProps {
  content: SwotContent;
}

export const SwotSection = ({ content }: SwotSectionProps) => {
  return (
    <AnalysisSection
      title="SWOT Analysis"
      description="Personalized strengths, weaknesses, opportunities, and threats"
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-semibold text-green-700">Strengths</h4>
            <ul className="space-y-2">
              {content.strengths.map((item, idx) => (
                <li key={idx} className="text-sm text-text-secondary">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-red-700">Weaknesses</h4>
            <ul className="space-y-2">
              {content.weaknesses.map((item, idx) => (
                <li key={idx} className="text-sm text-text-secondary">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-blue-700">Opportunities</h4>
            <ul className="space-y-2">
              {content.opportunities.map((item, idx) => (
                <li key={idx} className="text-sm text-text-secondary">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-semibold text-orange-700">Threats</h4>
            <ul className="space-y-2">
              {content.threats.map((item, idx) => (
                <li key={idx} className="text-sm text-text-secondary">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Personalized Insights</h4>
          <p className="text-text-secondary">{content.personalizedInsights}</p>
        </div>
      </div>
    </AnalysisSection>
  );
};
