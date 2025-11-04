import { useNavigate } from "react-router-dom";
import { Idea } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";

interface IdeaCardProps {
  idea: Idea;
  onDelete?: (id: string) => void;
}

const statusVariants: Record<string, "default" | "warning" | "success" | "error"> = {
  pending: "default",
  analyzing: "warning",
  completed: "success",
  failed: "error",
};

export const IdeaCard = ({ idea, onDelete }: IdeaCardProps) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/app/ideas/${idea.id}`);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this idea?")) {
      onDelete?.(idea.id);
    }
  };

  return (
    <Card className="cursor-pointer" onClick={handleView}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle>{idea.title}</CardTitle>
            <CardDescription>{new Date(idea.createdAt).toLocaleDateString()}</CardDescription>
          </div>
          <Badge variant={statusVariants[idea.status]}>{idea.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-text-secondary">{idea.description}</p>
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={handleView}>
            View Details
          </Button>
          <Button size="sm" variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
