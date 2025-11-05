import { GoogleKeywordsContent } from "@/types";
import { AnalysisSection } from "./AnalysisSection";
import { Search } from "lucide-react";
import { Badge } from "../common/Badge";

interface GoogleKeywordsSectionProps {
  content: GoogleKeywordsContent;
}

const sentimentColors = {
  positive: "bg-green-500",
  neutral: "bg-yellow-500",
  negative: "bg-red-500",
};

const sentimentTextColors = {
  positive: "text-green-700",
  neutral: "text-yellow-700",
  negative: "text-red-700",
};

const competitionVariants = {
  low: "success" as const,
  medium: "warning" as const,
  high: "error" as const,
};

export const GoogleKeywordsSection = ({ content }: GoogleKeywordsSectionProps) => {
  // Sort keywords by relevance score
  const sortedKeywords = [...content.keywords].sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Find max relevance score for bar chart scaling
  const maxRelevance = Math.max(...content.keywords.map((k) => k.relevanceScore));

  return (
    <AnalysisSection
      title="Google Keyword Analysis"
      description="Search trends and keyword opportunities"
      icon={<Search size={28} />}
      fullWidth
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="rounded-lg bg-blue-50 p-4">
          <p className="text-text-secondary">{content.summary}</p>
        </div>

        {/* Keywords Chart */}
        <div>
          <h4 className="mb-4 text-lg font-semibold">Top Keywords by Relevance</h4>
          <div className="space-y-3">
            {sortedKeywords.map((keyword, idx) => (
              <div key={idx} className="group">
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-text-primary">{keyword.term}</span>
                    <div className="flex gap-2">
                      <Badge variant="info" size="sm">
                        {keyword.searchVolume}
                      </Badge>
                      <Badge variant={competitionVariants[keyword.competitionLevel]} size="sm">
                        {keyword.competitionLevel} competition
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${sentimentColors[keyword.sentiment]}`}
                      title={`${keyword.sentiment} sentiment`}
                    />
                    <span className={`text-sm font-medium ${sentimentTextColors[keyword.sentiment]}`}>
                      {keyword.sentiment}
                    </span>
                  </div>
                </div>
                {/* Bar Chart */}
                <div className="relative h-8 w-full rounded-lg bg-gray-100">
                  <div
                    className="h-full rounded-lg bg-gradient-to-r from-primary to-primary-dark transition-all duration-500 ease-out group-hover:opacity-90"
                    style={{ width: `${(keyword.relevanceScore / maxRelevance) * 100}%` }}
                  >
                    <div className="flex h-full items-center justify-end px-3">
                      <span className="text-sm font-semibold text-white">
                        {keyword.relevanceScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="mb-3 text-lg font-semibold">Strategic Recommendations</h4>
          <ul className="modern-list">
            {content.recommendations.map((recommendation, idx) => (
              <li key={idx}>{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>
    </AnalysisSection>
  );
};
