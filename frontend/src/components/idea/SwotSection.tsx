import { SwotContent } from '@/types';
import { AnalysisSection } from './AnalysisSection';
import { TrendingUp } from 'lucide-react';

interface SwotSectionProps {
  content: SwotContent;
}

export const SwotSection = ({ content }: SwotSectionProps) => {
  return (
    <AnalysisSection
      title="SWOT Analysis"
      description="Personalized strengths, weaknesses, opportunities, and threats"
      icon={<TrendingUp size={28} />}
    >
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 text-green-700">Strengths</h4>
            <ul className="modern-list">
              {content.strengths.map((item, idx) => (
                <li key={idx}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-red-700">Weaknesses</h4>
            <ul className="modern-list">
              {content.weaknesses.map((item, idx) => (
                <li key={idx}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-blue-700">Opportunities</h4>
            <ul className="modern-list">
              {content.opportunities.map((item, idx) => (
                <li key={idx}>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-orange-700">Threats</h4>
            <ul className="modern-list">
              {content.threats.map((item, idx) => (
                <li key={idx}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <h4 className="mb-3">Personalized Insights</h4>
          <p className="text-text-secondary">{content.personalizedInsights}</p>
        </div>
      </div>
    </AnalysisSection>
  );
};
