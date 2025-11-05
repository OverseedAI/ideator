import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Idea, Analysis, AnalysisSectionType } from "@/types";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SkeletonCard } from "@/components/common/Skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card";
import { EducationSectionComponent } from "@/components/idea/EducationSection";
import { SwotSection } from "@/components/idea/SwotSection";
import { FeaturesSection } from "@/components/idea/FeaturesSection";
import { ViabilitySection } from "@/components/idea/ViabilitySection";
import { AnalysisSection } from "@/components/idea/AnalysisSection";
import { Lightbulb, Target, DollarSign, ListChecks, Download } from "lucide-react";
import { useIdea, useDeleteIdea } from "@/hooks/queries/useIdeas";
import { useAnalyses } from "@/hooks/queries/useAnalyses";
import { getErrorMessage } from "@/utils/error";
import { exportIdeaToPdf } from "@/services/ideaService";

const statusVariants: Record<Idea["status"], "default" | "warning" | "success" | "error"> = {
  pending: "default",
  analyzing: "warning",
  completed: "success",
  failed: "error",
};

export const IdeaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const {
    data: idea,
    isLoading: isIdeaLoading,
    isError: isIdeaError,
    error: ideaError,
    refetch: refetchIdea,
  } = useIdea(id, {
    enabled: Boolean(id),
  });

  const ideaStatus = idea?.status;
  const isAnalysisInProgress = ideaStatus === "pending" || ideaStatus === "analyzing";

  const analysesQuery = useAnalyses(id, {
    enabled: Boolean(id),
    refetchInterval: isAnalysisInProgress ? 5000 : false,
  });

  const deleteMutation = useDeleteIdea();

  useEffect(() => {
    if (!isAnalysisInProgress) {
      return;
    }

    const interval = setInterval(() => {
      refetchIdea();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAnalysisInProgress, refetchIdea]);

  const analysesByType = useMemo(() => {
    const map = new Map<AnalysisSectionType, Analysis>();
    for (const analysis of analysesQuery.data ?? []) {
      map.set(analysis.sectionType, analysis);
    }
    return map;
  }, [analysesQuery.data]);

  const getAnalysis = (type: AnalysisSectionType) => analysesByType.get(type);

  const handleDelete = () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this idea? This action cannot be undone.")) {
      return;
    }

    deleteMutation.mutate(id, {
      onSuccess: () => {
        navigate("/app");
      },
    });
  };

  const handleExportPdf = async () => {
    if (!id) return;

    setIsExportingPdf(true);
    try {
      const blob = await exportIdeaToPdf(id);

      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${idea?.title || "idea"}-analysis.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (isIdeaLoading && !idea) {
    return (
      <div>
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/app")}>
            ← Back to Dashboard
          </Button>
        </div>
        <SkeletonCard />
        <div className="mt-8 space-y-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (isIdeaError || !idea) {
    const message = getErrorMessage(ideaError, "Failed to load idea");
    return <div className="rounded-lg bg-red-50 p-4 text-red-800">{message}</div>;
  }

  const analysesErrorMessage = analysesQuery.isError
    ? getErrorMessage(analysesQuery.error, "Failed to load analyses")
    : "";

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/app")}>
          ← Back to Dashboard
        </Button>
        <div className="flex gap-3">
          {idea?.status === "completed" && (
            <Button
              variant="outline"
              onClick={handleExportPdf}
              isLoading={isExportingPdf}
              disabled={isExportingPdf}
            >
              <Download size={16} className="mr-2" />
              Export as PDF
            </Button>
          )}
          <Button
            variant="danger"
            onClick={handleDelete}
            isLoading={deleteMutation.isPending}
            disabled={deleteMutation.isPending}
          >
            Delete Idea
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle icon={<Lightbulb size={28} />}>{idea.title}</CardTitle>
              <CardDescription>
                Created {new Date(idea.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant={statusVariants[idea.status]}>{idea.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">{idea.description}</p>
        </CardContent>
      </Card>

      {isAnalysisInProgress && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 text-blue-800">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <span>AI is analyzing your idea. This may take a few moments...</span>
          </div>
        </div>
      )}

      {idea.status === "failed" && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-800">
          Analysis failed. Please try again.
        </div>
      )}

      {analysesQuery.isError && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-800">{analysesErrorMessage}</div>
      )}

      {(analysesQuery.data?.length ?? 0) > 0 || isAnalysisInProgress ? (
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
                      <strong>Size:</strong>{" "}
                      {getAnalysis("business_values")!.content.targetMarket.size}
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
      ) : null}
    </div>
  );
};
