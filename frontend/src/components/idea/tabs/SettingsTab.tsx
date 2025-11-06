import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Idea } from "@/types";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { Settings, Trash2 } from "lucide-react";
import { useUpdateIdea, useDeleteIdea } from "@/hooks/queries/useIdeas";

interface SettingsTabProps {
  idea: Idea;
}

export const SettingsTab = ({ idea }: SettingsTabProps) => {
  const navigate = useNavigate();
  const [editedTitle, setEditedTitle] = useState(idea.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const updateMutation = useUpdateIdea();
  const deleteMutation = useDeleteIdea();

  const handleSaveTitle = () => {
    if (!editedTitle.trim() || editedTitle === idea.title) {
      setIsEditingTitle(false);
      setEditedTitle(idea.title);
      return;
    }

    updateMutation.mutate(
      { id: idea.id, data: { title: editedTitle } },
      {
        onSuccess: () => {
          setIsEditingTitle(false);
        },
        onError: () => {
          alert("Failed to update idea title. Please try again.");
        },
      }
    );
  };

  const handleCancelEdit = () => {
    setEditedTitle(idea.title);
    setIsEditingTitle(false);
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this idea? This action cannot be undone.")) {
      return;
    }

    deleteMutation.mutate(idea.id, {
      onSuccess: () => {
        navigate("/app");
      },
      onError: () => {
        alert("Failed to delete idea. Please try again.");
      },
    });
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Settings size={28} className="text-text-secondary" />
        <h2 className="text-2xl font-bold text-text-primary">Idea Settings</h2>
      </div>

      <div className="space-y-4">
        {/* Idea Title Setting */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-text-primary mb-1">Idea Title</h3>
                <p className="text-sm text-text-secondary">
                  Update the title of your idea to better reflect your vision.
                </p>
              </div>
              <div className="flex-1">
                {isEditingTitle ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSaveTitle()}
                      className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveTitle}
                        size="sm"
                        isLoading={updateMutation.isPending}
                        disabled={updateMutation.isPending}
                      >
                        Save
                      </Button>
                      <Button onClick={handleCancelEdit} variant="ghost" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-text-primary">{idea.title}</span>
                    <Button onClick={() => setIsEditingTitle(true)} variant="secondary" size="sm">
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delete Idea Setting */}
        <Card>
          <CardContent className="py-6">
            <div className="flex items-start justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-base font-semibold text-text-primary mb-1">Delete Idea</h3>
                <p className="text-sm text-text-secondary">
                  Permanently delete this idea and all associated analysis. This action cannot be undone.
                </p>
              </div>
              <div className="flex-1 flex justify-end">
                <Button
                  variant="danger"
                  onClick={handleDelete}
                  isLoading={deleteMutation.isPending}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete Idea
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
