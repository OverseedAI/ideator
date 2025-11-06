import { useState, useEffect } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Idea } from "@/types";
import { useUpdateIdea } from "@/hooks/queries/useIdeas";

interface EditIdeaTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  idea: Idea;
}

export const EditIdeaTitleModal = ({ isOpen, onClose, idea }: EditIdeaTitleModalProps) => {
  const [title, setTitle] = useState(idea.title);
  const updateMutation = useUpdateIdea();

  // Reset title when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle(idea.title);
    }
  }, [isOpen, idea.title]);

  const handleSave = () => {
    if (!title.trim() || title === idea.title) {
      onClose();
      return;
    }

    updateMutation.mutate(
      { id: idea.id, data: { title } },
      {
        onSuccess: () => {
          onClose();
        },
        onError: () => {
          alert("Failed to update idea title. Please try again.");
        },
      }
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Idea Title">
      <div className="space-y-4">
        <div>
          <label htmlFor="idea-title" className="block text-sm font-medium text-text-primary mb-2">
            Idea Title
          </label>
          <input
            id="idea-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2 text-text-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
            placeholder="Enter idea title..."
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            isLoading={updateMutation.isPending}
            disabled={updateMutation.isPending || !title.trim()}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </Modal>
  );
};
