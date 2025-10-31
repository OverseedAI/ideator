import { FeaturesContent } from '@/types';
import { AnalysisSection } from './AnalysisSection';

interface FeaturesSectionProps {
  content: FeaturesContent;
}

export const FeaturesSection = ({ content }: FeaturesSectionProps) => {
  const allFeatures = content.features;

  return (
    <AnalysisSection
      title="Feature Analysis"
      description="Core features and competitive comparison"
    >
      <div className="space-y-6">
        <div>
          <h4 className="mb-3 font-semibold">Recommended Features</h4>
          <ul className="grid gap-2 md:grid-cols-2">
            {content.features.map((feature, idx) => (
              <li key={idx} className="text-sm text-text-secondary">
                • {feature}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">Competitive Comparison</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold">
                    Competitor
                  </th>
                  {allFeatures.map((feature, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-3 text-center font-semibold"
                    >
                      {feature}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.competitiveAnalysis.map((competitor, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="px-4 py-3 font-medium">
                      {competitor.competitor}
                    </td>
                    {allFeatures.map((feature, fIdx) => (
                      <td key={fIdx} className="px-4 py-3 text-center">
                        {competitor.features[feature] ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-red-600">✗</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AnalysisSection>
  );
};
