import { FeatureComparisonContent } from "@/types";
import { AnalysisSection } from "./AnalysisSection";
import { Layers } from "lucide-react";

interface FeatureComparisonSectionProps {
  content: FeatureComparisonContent;
}

export const FeatureComparisonSection = ({ content }: FeatureComparisonSectionProps) => {
  return (
    <AnalysisSection
      title="Feature Comparison"
      description="Validated competitive feature analysis with evidence"
      icon={<Layers size={28} />}
    >
      <div className="space-y-6">
        {/* Feature List with Descriptions */}
        <div>
          <h4 className="mb-3">Features</h4>
          <div className="space-y-3">
            {content.features.map((feature, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="font-bold text-base">{feature.name}</div>
                <div className="text-sm text-muted-foreground mt-1">{feature.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitive Comparison Table */}
        <div>
          <h4 className="mb-3">Competitive Comparison</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-semibold">Competitor</th>
                  {content.features.map((feature, idx) => (
                    <th key={idx} className="px-4 py-3 text-center font-semibold">
                      {feature.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {content.competitors.map((competitor, idx) => (
                  <tr key={idx} className="border-b border-border">
                    <td className="px-4 py-3 font-medium">
                      <a
                        href={competitor.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {competitor.name}
                      </a>
                    </td>
                    {content.features.map((feature, fIdx) => {
                      const competitorFeature = competitor.features.find(
                        (f) => f.featureName === feature.name
                      );
                      const hasFeature = competitorFeature?.hasFeature ?? false;
                      const proofUrl = competitorFeature?.proofUrl;

                      return (
                        <td key={fIdx} className="px-4 py-3 text-center">
                          {hasFeature && proofUrl ? (
                            <a
                              href={proofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-2xl hover:scale-110 inline-block transition-transform"
                              title={`Evidence: ${proofUrl}`}
                            >
                              ✅
                            </a>
                          ) : (
                            <span className="text-2xl">❌</span>
                          )}
                        </td>
                      );
                    })}
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
