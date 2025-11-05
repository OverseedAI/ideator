import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { IdeaCard } from "@/components/dashboard/IdeaCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { useDeleteIdea, useIdeas } from "@/hooks/queries/useIdeas";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { data: ideas, isLoading, isError, error } = useIdeas();
  const deleteIdea = useDeleteIdea();

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (!err) return "";
    if (err instanceof AxiosError) {
      return (err.response?.data as { error?: string })?.error ?? fallback;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return fallback;
  };

  const listErrorMessage = getErrorMessage(error, "Failed to load ideas");
  const deleteErrorMessage = getErrorMessage(deleteIdea.error, "Failed to delete idea");
  const displayedError = deleteErrorMessage || listErrorMessage;

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this idea?")) {
      return;
    }
    deleteIdea.mutate(id);
  };

  if (isLoading && !ideas) {
    return (
      <div className="flex h-96 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-text-secondary">Manage your business ideas and analyses</p>
        </div>
        <Button onClick={() => navigate("/app/ideas/new")}>New Idea</Button>
      </div>

        {(isError || deleteIdea.isError) && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
            {displayedError || "Something went wrong"}
          </div>
        )}

        {(ideas ?? []).length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(ideas ?? []).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} onDelete={handleDelete} />
            ))}
          </div>
        )}
    </div>
  );
};
