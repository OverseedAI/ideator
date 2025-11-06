import { Analysis, AnalysisSectionType } from "@/types";
import { EducationSectionComponent } from "../EducationSection";
import { SwotSection } from "../SwotSection";
import { FeaturesSection } from "../FeaturesSection";
import { FeatureComparisonSection } from "../FeatureComparisonSection";
import { GoogleKeywordsSection } from "../GoogleKeywordsSection";
import { AnalysisSection } from "../AnalysisSection";
import { ViabilitySection } from "../ViabilitySection";
import { SkeletonCard } from "@/components/common/Skeleton";
import { DollarSign, Target, ListChecks } from "lucide-react";
import { Badge } from "@/components/common/Badge";

interface AnalysisTabProps {
  analyses: Analysis[];
  isAnalysisInProgress: boolean;
}

export const AnalysisTab = ({ analyses, isAnalysisInProgress }: AnalysisTabProps) => {
  const analysesByType = new Map<AnalysisSectionType, Analysis>();
  for (const analysis of analyses) {
    analysesByType.set(analysis.sectionType, analysis);
  }

  const getAnalysis = (type: AnalysisSectionType) => analysesByType.get(type);

  return (
    <>
      <div className="space-y-8">
        {getAnalysis("education") ? (
          <EducationSectionComponent content={getAnalysis("education")!.content} />
        ) : (
          isAnalysisInProgress && <SkeletonCard />
        )}

        {getAnalysis("swot") ? (
          <SwotSection content={getAnalysis("swot")!.content} />
        ) : (
          isAnalysisInProgress && <SkeletonCard />
        )}

        {getAnalysis("features") ? (
          <FeaturesSection content={getAnalysis("features")!.content} />
        ) : (
          isAnalysisInProgress && <SkeletonCard />
        )}

        {getAnalysis("feature_comparison") ? (
          <FeatureComparisonSection content={getAnalysis("feature_comparison")!.content} />
        ) : (
          isAnalysisInProgress && <SkeletonCard />
        )}

        {getAnalysis("google_keywords") ? (
          <GoogleKeywordsSection content={getAnalysis("google_keywords")!.content} />
        ) : (
          isAnalysisInProgress && <SkeletonCard />
        )}

        {getAnalysis("business_values") ? (
          <AnalysisSection
            title="Business Values"
            description="Core differentiators and strategy"
            icon={<DollarSign size={28} />}
          >
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-3">Product Differentiators (Moats)</h4>
                <ul className="modern-list">
                  {getAnalysis("business_values")!.content.moats.map(
                    (moat: string, idx: number) => (
                      <li key={idx}>{moat}</li>
                    )
                  )}
                </ul>
              </div>
              <div>
                <h4 className="mb-3">Target Market</h4>
                <p className="text-text-secondary mb-2">
                  <strong>Size:</strong> {getAnalysis("business_values")!.content.targetMarket.size}
                </p>
                <p className="text-text-secondary mb-2">
                  <strong>Segments:</strong>{" "}
                  {getAnalysis("business_values")!.content.targetMarket.segments.join(", ")}
                </p>
                <p className="text-text-secondary">
                  {getAnalysis("business_values")!.content.targetMarket.description}
                </p>
              </div>
              <div>
                <h4 className="mb-3">Pricing Strategies</h4>
                {getAnalysis("business_values")!.content.pricingStrategies.map(
                  (strategy: any, idx: number) => (
                    <div key={idx} className="mb-3">
                      <p className="font-medium text-text-primary">{strategy.model}</p>
                      <p className="text-text-secondary">{strategy.rationale}</p>
                    </div>
                  )
                )}
              </div>
              <div>
                <h4 className="mb-3">Timeline to Market</h4>
                <p className="text-text-secondary">
                  {getAnalysis("business_values")!.content.timelineToMarket}
                </p>
              </div>
            </div>
          </AnalysisSection>
        ) : (
          isAnalysisInProgress && <SkeletonCard />
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {getAnalysis("pmf") ? (
          <AnalysisSection
            title="Product-Market Fit Strategies"
            description="Quick validation approaches"
            icon={<Target size={28} />}
          >
            <div className="space-y-4">
              {getAnalysis("pmf")!.content.strategies.map((strategy: any, idx: number) => (
                <div key={idx} className="rounded-lg border border-border p-4">
                  <h4 className="text-text-primary">{strategy.title}</h4>
                  <div className="mt-2 flex gap-2">
                    <Badge
                      variant={
                        strategy.effort === "low"
                          ? "success"
                          : strategy.effort === "medium"
                            ? "warning"
                            : "error"
                      }
                    >
                      {strategy.effort} effort
                    </Badge>
                    <Badge variant="info">{strategy.timeline}</Badge>
                  </div>
                  <p className="mt-3 text-text-secondary">{strategy.description}</p>
                </div>
              ))}
            </div>
          </AnalysisSection>
        ) : (
          isAnalysisInProgress && <SkeletonCard />
        )}

        {getAnalysis("next_steps") ? (
          <AnalysisSection
            title="Next Steps"
            description="Recommended actions to get started"
            icon={<ListChecks size={28} />}
          >
            <div className="space-y-4">
              {getAnalysis("next_steps")!
                .content.steps.sort((a: any, b: any) => a.priority - b.priority)
                .map((step: any, idx: number) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white font-semibold text-base">
                      {step.priority}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-text-primary">{step.title}</h4>
                      <p className="mt-1 text-text-secondary">{step.description}</p>
                      <p className="mt-2 text-sm text-text-secondary opacity-75">
                        Estimated time: {step.estimatedTime}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </AnalysisSection>
        ) : (
          isAnalysisInProgress && <SkeletonCard />
        )}

        {getAnalysis("viability") ? (
          <ViabilitySection content={getAnalysis("viability")!.content} />
        ) : (
          isAnalysisInProgress && <SkeletonCard />
        )}
      </div>
    </>
  );
};
