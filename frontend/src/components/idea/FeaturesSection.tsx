import { FeaturesContent } from "@/types";
import { AnalysisSection } from "./AnalysisSection";
import { Zap } from "lucide-react";

interface FeaturesSectionProps {
  content: FeaturesContent;
}

export const FeaturesSection = ({ content }: FeaturesSectionProps) => {
  const allFeatures = content.features;

  return (
    <AnalysisSection
      title="Feature Analysis"
      description="Core features and competitive comparison"
      icon={<Zap size={28} />}
    >
      <div className="space-y-6">
        <div>
          <h4 className="mb-3">Recommended Features</h4>
          <ul className="modern-list md:grid md:grid-cols-2">
            {content.features.map((feature, idx) => (
              <li key={idx}>{feature}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3">Competitive Comparison</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold">Competitor</th>
                  {allFeatures.map((feature, idx) => (
                    <th key={idx} className="px-4 py-3 text-center font-semibold">
                      {feature}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.competitiveAnalysis.map((competitor, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="px-4 py-3 font-medium">{competitor.competitor}</td>
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
