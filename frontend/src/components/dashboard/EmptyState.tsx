import { useNavigate } from "react-router-dom";
import { Button } from "@/components/common/Button";

export const EmptyState = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface p-12 text-center">
      <div className="mx-auto max-w-md">
        <h3 className="text-xl font-semibold text-text-primary">No ideas yet</h3>
        <p className="mt-2 text-text-secondary">
          Start your journey by submitting your first business idea. Our AI will analyze it and
          provide comprehensive insights.
        </p>
        <Button className="mt-6" onClick={() => navigate("/app/ideas/new")}>
          Create Your First Idea
        </Button>
      </div>
    </div>
  );
};
