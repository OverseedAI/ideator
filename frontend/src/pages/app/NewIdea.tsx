import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { Button } from "@/components/common/Button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card";
import { useAnalyzeIdea, useCreateIdea } from "@/hooks/queries/useIdeas";
import { getErrorMessage } from "@/utils/error";

export const NewIdea = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const createIdeaMutation = useCreateIdea();
  const analyzeIdeaMutation = useAnalyzeIdea();

  const createErrorMessage = createIdeaMutation.error
    ? getErrorMessage(createIdeaMutation.error, "Failed to create idea")
    : "";
  const analyzeErrorMessage = analyzeIdeaMutation.error
    ? getErrorMessage(analyzeIdeaMutation.error, "Failed to start analysis")
    : "";
  const errorMessage = createErrorMessage || analyzeErrorMessage;

  const isSubmitting = createIdeaMutation.isPending || analyzeIdeaMutation.isPending;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const idea = await createIdeaMutation.mutateAsync({ title, description });
      await analyzeIdeaMutation.mutateAsync(idea.id);
      navigate(`/app/ideas/${idea.id}`);
    } catch (err) {
      console.error("Failed to create or analyze idea", err);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">New Business Idea</h1>
        <p className="mt-2 text-text-secondary">
          Describe your business idea and let our AI analyze it
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Idea Details</CardTitle>
          <CardDescription>
            Provide a clear title and detailed description of your business idea
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{errorMessage}</div>
            )}

            <Input
              label="Idea Title"
              placeholder="e.g., Database subsetting tool for developers"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              maxLength={200}
            />

            <Textarea
              label="Description"
              placeholder="Describe your business idea in detail. What problem does it solve? Who is the target audience? What makes it unique?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              minLength={10}
              maxLength={5000}
              rows={8}
            />

            <div className="flex gap-4">
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Idea"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/app")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
