import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Idea } from "@/types";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { SkeletonCard } from "@/components/common/Skeleton";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/common/Card";
import { Tabs, TabPanel } from "@/components/common/Tabs";
import { AnalysisTab } from "@/components/idea/tabs/AnalysisTab";
import { TasksTab } from "@/components/idea/tabs/TasksTab";
import { SocialMediaTab } from "@/components/idea/tabs/SocialMediaTab";
import { LeadsTab } from "@/components/idea/tabs/LeadsTab";
import { SettingsTab } from "@/components/idea/tabs/SettingsTab";
import { ChatDrawer } from "@/components/chat/ChatDrawer";
import { Lightbulb, Download, BarChart3, ListTodo, Share2, Users, Settings, MessageSquare } from "lucide-react";
import { useIdea } from "@/hooks/queries/useIdeas";
import { useAnalyses } from "@/hooks/queries/useAnalyses";
import { getErrorMessage } from "@/utils/error";
import { exportIdeaToPdf } from "@/services/ideaService";
import { cn } from "@/utils/cn";

const statusVariants: Record<Idea["status"], "default" | "warning" | "success" | "error"> = {
  pending: "default",
  analyzing: "warning",
  completed: "success",
  failed: "error",
};

const tabs = [
  { id: "analysis", label: "Analysis", icon: <BarChart3 size={18} /> },
  { id: "tasks", label: "Tasks", icon: <ListTodo size={18} /> },
  { id: "social", label: "Social Media", icon: <Share2 size={18} /> },
  { id: "leads", label: "Leads", icon: <Users size={18} /> },
  { id: "settings", label: "Settings", icon: <Settings size={18} /> },
];

export const IdeaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);

  const activeTab = searchParams.get("tab") || "analysis";

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

  useEffect(() => {
    if (!isAnalysisInProgress) {
      return;
    }

    const interval = setInterval(() => {
      refetchIdea();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAnalysisInProgress, refetchIdea]);

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
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
        {idea?.status === "completed" && activeTab === "analysis" && (
          <Button
            variant="secondary"
            onClick={handleExportPdf}
            isLoading={isExportingPdf}
            disabled={isExportingPdf}
          >
            <Download size={16} className="mr-2" />
            Export as PDF
          </Button>
        )}
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

      {isAnalysisInProgress && activeTab === "analysis" && (
        <div className="mb-8 rounded-lg bg-blue-50 p-4 text-blue-800">
          <div className="flex items-center gap-3">
            <LoadingSpinner size="sm" />
            <span>AI is analyzing your idea. This may take a few moments...</span>
          </div>
        </div>
      )}

      {idea.status === "failed" && activeTab === "analysis" && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-800">
          Analysis failed. Please try again.
        </div>
      )}

      {analysesQuery.isError && activeTab === "analysis" && (
        <div className="mb-8 rounded-lg bg-red-50 p-4 text-red-800">{analysesErrorMessage}</div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <TabPanel isActive={activeTab === "analysis"}>
        {(analysesQuery.data?.length ?? 0) > 0 || isAnalysisInProgress ? (
          <AnalysisTab analyses={analysesQuery.data ?? []} isAnalysisInProgress={isAnalysisInProgress} />
        ) : (
          <div className="py-12 text-center">
            <BarChart3 size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <p className="text-text-secondary">
              No analysis available yet. Analysis will appear here once completed.
            </p>
          </div>
        )}
      </TabPanel>

      <TabPanel isActive={activeTab === "tasks"}>
        <TasksTab ideaId={id!} analyses={analysesQuery.data ?? []} />
      </TabPanel>

      <TabPanel isActive={activeTab === "social"}>
        <SocialMediaTab />
      </TabPanel>

      <TabPanel isActive={activeTab === "leads"}>
        <LeadsTab />
      </TabPanel>

      <TabPanel isActive={activeTab === "settings"}>
        <SettingsTab idea={idea} />
      </TabPanel>

      {/* Floating Chat Toggle Button */}
      <button
        onClick={() => setIsChatDrawerOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-30",
          "w-14 h-14 rounded-full bg-primary text-white shadow-elevated",
          "flex items-center justify-center",
          "hover:bg-primary-dark hover:scale-110 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          isChatDrawerOpen && "opacity-0 pointer-events-none"
        )}
        aria-label="Open AI chat"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Drawer */}
      {id && (
        <ChatDrawer
          ideaId={id}
          isOpen={isChatDrawerOpen}
          onClose={() => setIsChatDrawerOpen(false)}
          onAnalyticsEvent={(event, data) => {
            // Analytics integration placeholder
            console.log("Analytics event:", event, data);
          }}
        />
      )}
    </div>
  );
};
