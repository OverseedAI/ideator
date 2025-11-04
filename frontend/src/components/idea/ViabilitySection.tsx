import { ViabilityContent } from "@/types";
import { AnalysisSection } from "./AnalysisSection";
import { BarChart3 } from "lucide-react";

interface ViabilitySectionProps {
  content: ViabilityContent;
}

export const ViabilitySection = ({ content }: ViabilitySectionProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <AnalysisSection
      title="Viability Score"
      description="Overall assessment based on your profile"
      icon={<BarChart3 size={28} />}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className={`text-6xl font-bold ${getScoreColor(content.score)}`}>
              {content.score}
            </div>
            <div className="mt-2 text-text-secondary">out of 100</div>
          </div>
        </div>

        <div>
          <h4 className="mb-4">Factor Breakdown</h4>
          <div className="space-y-4">
            {content.factors.map((factor, idx) => (
              <div key={idx}>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium text-text-primary">{factor.category}</span>
                  <span className={`font-semibold ${getScoreColor(factor.score)}`}>
                    {factor.score}/100
                  </span>
                </div>
                <div className="mb-1 h-2 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <p className="text-text-secondary">{factor.reasoning}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-3">Overall Assessment</h4>
          <p className="text-text-secondary">{content.overallAssessment}</p>
        </div>
      </div>
    </AnalysisSection>
  );
};
