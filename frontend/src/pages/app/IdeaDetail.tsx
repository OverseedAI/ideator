import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Idea, Analysis, AnalysisSectionType } from "@/types";
import * as ideaService from "@/services/ideaService";
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
import { Lightbulb, Target, DollarSign, ListChecks } from "lucide-react";

export const IdeaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const streamCleanupRef = useRef<(() => void) | null>(null);

  const loadIdea = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError("");
      const [ideaData, analysesData] = await Promise.all([
        ideaService.getIdeaById(id),
        ideaService.getIdeaAnalyses(id),
      ]);
      setIdea(ideaData);
      setAnalyses(analysesData);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load idea");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset state when id changes
    setIdea(null);
    setAnalyses([]);
    setError("");
    loadIdea();

    // Clean up streaming connection
    return () => {
      if (streamCleanupRef.current) {
        streamCleanupRef.current();
        streamCleanupRef.current = null;
      }
    };
  }, [id]);

  // Auto-trigger analysis for pending ideas or set up streaming for analyzing ideas
  useEffect(() => {
    if (!idea || streamCleanupRef.current) return;

    if (idea.status === "pending") {
      // Trigger analysis by starting the stream
      // The backend will update status to 'analyzing' when it starts
      setIdea((prev) => (prev ? { ...prev, status: "analyzing" } : null));

      const cleanup = ideaService.analyzeIdeaStream(
        idea.id,
        // On section received
        (analysis: Analysis) => {
          setAnalyses((prev) => {
            // Check if this section already exists
            const exists = prev.find((a) => a.sectionType === analysis.sectionType);
            if (exists) {
              return prev; // Don't add duplicates
            }
            return [...prev, analysis];
          });
        },
        // On complete
        () => {
          setIdea((prev) => (prev ? { ...prev, status: "completed" } : null));
          if (streamCleanupRef.current) {
            streamCleanupRef.current = null;
          }
        },
        // On error
        (errorMsg: string) => {
          setError(errorMsg);
          setIdea((prev) => (prev ? { ...prev, status: "failed" } : null));
          if (streamCleanupRef.current) {
            streamCleanupRef.current = null;
          }
        }
      );

      streamCleanupRef.current = cleanup;
    } else if (idea.status === "analyzing") {
      // Already analyzing, just set up the stream to catch updates
      const cleanup = ideaService.analyzeIdeaStream(
        idea.id,
        // On section received
        (analysis: Analysis) => {
          setAnalyses((prev) => {
            // Check if this section already exists
            const exists = prev.find((a) => a.sectionType === analysis.sectionType);
            if (exists) {
              return prev; // Don't add duplicates
            }
            return [...prev, analysis];
          });
        },
        // On complete
        () => {
          setIdea((prev) => (prev ? { ...prev, status: "completed" } : null));
          if (streamCleanupRef.current) {
            streamCleanupRef.current = null;
          }
        },
        // On error
        (errorMsg: string) => {
          setError(errorMsg);
          setIdea((prev) => (prev ? { ...prev, status: "failed" } : null));
          if (streamCleanupRef.current) {
            streamCleanupRef.current = null;
          }
        }
      );

      streamCleanupRef.current = cleanup;
    }

    return () => {
      // Don't clean up here, let the id change effect handle it
    };
  }, [idea?.status, idea?.id]);

  const getAnalysis = (type: AnalysisSectionType) => {
    return analyses.find((a) => a.sectionType === type);
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this idea? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await ideaService.deleteIdea(id);
      navigate("/app");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete idea");
      setIsDeleting(false);
    }
  };

  const handleRetry = async () => {
    if (!idea || !id) return;

    setIsRetrying(true);
    setError("");

    // Update status to analyzing locally
    setIdea((prev) => (prev ? { ...prev, status: "analyzing" } : null));

    // Set up streaming for retry
    const cleanup = ideaService.analyzeIdeaStream(
      idea.id,
      // On section received
      (analysis: Analysis) => {
        setAnalyses((prev) => {
          // Check if this section already exists
          const exists = prev.find((a) => a.sectionType === analysis.sectionType);
          if (exists) {
            return prev; // Don't add duplicates
          }
          return [...prev, analysis];
        });
      },
      // On complete
      () => {
        setIdea((prev) => (prev ? { ...prev, status: "completed" } : null));
        setIsRetrying(false);
        if (streamCleanupRef.current) {
          streamCleanupRef.current = null;
        }
      },
      // On error
      (errorMsg: string) => {
        setError(errorMsg);
        setIdea((prev) => (prev ? { ...prev, status: "failed" } : null));
        setIsRetrying(false);
        if (streamCleanupRef.current) {
          streamCleanupRef.current = null;
        }
      }
    );

    streamCleanupRef.current = cleanup;
  };

  if (isLoading) {
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

  if (error || !idea) {
    return <div className="rounded-lg bg-red-50 p-4 text-red-800">{error || "Idea not found"}</div>;
  }

  const statusVariants: Record<string, "default" | "warning" | "success" | "error"> = {
    pending: "default",
    analyzing: "warning",
    completed: "success",
    failed: "error",
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/app")}>
          ← Back to Dashboard
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          isLoading={isDeleting}
          disabled={isDeleting}
        >
          Delete Idea
        </Button>
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

      {idea.status === "analyzing" && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 text-blue-800">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <span>AI is analyzing your idea. Sections will appear as they complete...</span>
          </div>
        </div>
      )}

      {idea.status === "failed" && (
        <div className="mb-8 rounded-lg bg-red-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-red-800">Analysis failed. Please try again.</span>
            <Button
              variant="primary"
              onClick={handleRetry}
              isLoading={isRetrying}
              disabled={isRetrying}
            >
              Retry Analysis
            </Button>
          </div>
        </div>
      )}

      {analyses.length > 0 && (
        <>
          <div className="space-y-8">
            {getAnalysis("education") && (
              <EducationSectionComponent content={getAnalysis("education")!.content} />
            )}

            {getAnalysis("swot") && <SwotSection content={getAnalysis("swot")!.content} />}

            {getAnalysis("features") && (
              <FeaturesSection content={getAnalysis("features")!.content} />
            )}

            {getAnalysis("business_values") && (
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
            )}
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            {getAnalysis("pmf") && (
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
            )}

            {getAnalysis("next_steps") && (
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
            )}

            {getAnalysis("viability") && (
              <ViabilitySection content={getAnalysis("viability")!.content} />
            )}
          </div>
        </>
      )}
    </div>
  );
};
