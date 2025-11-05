import { ReactNode, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/common/Card";
import { ChevronDown, ChevronUp } from "lucide-react";

interface AnalysisSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  fullWidth?: boolean;
  defaultCollapsed?: boolean;
}

export const AnalysisSection = ({
  title,
  description,
  icon,
  children,
  fullWidth = false,
  defaultCollapsed = false,
}: AnalysisSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  return (
    <Card className={fullWidth ? "col-span-full" : ""}>
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle icon={icon}>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <button
            className="ml-4 text-text-secondary hover:text-text-primary transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            aria-label={isCollapsed ? "Expand section" : "Collapse section"}
          >
            {isCollapsed ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </button>
        </div>
      </CardHeader>
      {!isCollapsed && <CardContent>{children}</CardContent>}
    </Card>
  );
};
