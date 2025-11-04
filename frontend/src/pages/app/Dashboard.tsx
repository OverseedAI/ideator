import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Idea } from "@/types";
import * as ideaService from "@/services/ideaService";
import { Button } from "@/components/common/Button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { IdeaCard } from "@/components/dashboard/IdeaCard";
import { EmptyState } from "@/components/dashboard/EmptyState";

export const Dashboard = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadIdeas = async () => {
    try {
      setIsLoading(true);
      const data = await ideaService.getUserIdeas();
      setIdeas(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load ideas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await ideaService.deleteIdea(id);
      setIdeas(ideas.filter((idea) => idea.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to delete idea");
    }
  };

  if (isLoading) {
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

      {error && <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">{error}</div>}

      {ideas.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};
