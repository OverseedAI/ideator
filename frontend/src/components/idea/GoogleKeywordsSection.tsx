import { useMemo } from "react";
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
  // Sort keywords by relevance score and take top 5
  const topKeywords = useMemo(
    () => [...content.keywords].sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, 5),
    [content.keywords]
  );

  // Build Google Trends embed URL
  const trendsUrl = useMemo(() => {
    const keywords = topKeywords.map((k) => k.term).join(",");
    const baseUrl = "https://trends.google.com/trends/embed/explore/TIMESERIES";
    const params = new URLSearchParams({
      req: JSON.stringify({
        comparisonItem: topKeywords.map((k) => ({
          keyword: k.term,
          geo: "US",
          time: "today 12-m",
        })),
        category: 0,
        property: "",
      }),
      tz: "-480",
      eq: `date=today 12-m&geo=US&q=${keywords}`,
    });
    return `${baseUrl}?${params.toString()}`;
  }, [topKeywords]);

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

        {/* Google Trends Chart */}
        <div>
          <h4 className="mb-4 text-lg font-semibold">Search Trends (Last 12 Months)</h4>
          <div className="relative w-full overflow-hidden rounded-lg border border-border bg-white">
            <iframe
              src={trendsUrl}
              className="h-[450px] w-full border-0"
              title="Google Trends Chart"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />
          </div>
          <div className="mt-3 text-sm text-text-secondary">
            Showing top {topKeywords.length} keywords by relevance
          </div>
        </div>

        {/* Keywords Table */}
        <div>
          <h4 className="mb-4 text-lg font-semibold">Keyword Details</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Keyword
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Search Volume
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Sentiment
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Competition
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                    Relevance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {content.keywords.map((keyword, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">
                      {keyword.term}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary">
                      {keyword.searchVolume}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${sentimentColors[keyword.sentiment]}`}
                        />
                        <span className={`text-sm ${sentimentTextColors[keyword.sentiment]}`}>
                          {keyword.sentiment}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={competitionVariants[keyword.competitionLevel]} size="sm">
                        {keyword.competitionLevel}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-text-primary">
                      {keyword.relevanceScore}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
