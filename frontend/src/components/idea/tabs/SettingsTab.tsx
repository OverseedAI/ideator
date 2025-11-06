import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Idea } from "@/types";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { Settings, Trash2 } from "lucide-react";
import { useDeleteIdea } from "@/hooks/queries/useIdeas";
import { EditIdeaTitleModal } from "@/components/idea/EditIdeaTitleModal";

interface SettingsTabProps {
  idea: Idea;
}

export const SettingsTab = ({ idea }: SettingsTabProps) => {
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const deleteMutation = useDeleteIdea();

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
              <div>
                <Button onClick={() => setIsEditModalOpen(true)} variant="secondary" size="sm">
                  Edit
                </Button>
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
              <div>
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

      <EditIdeaTitleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        idea={idea}
      />
    </div>
  );
};
