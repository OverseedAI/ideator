import { useEffect, useRef, useState } from "react";
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

declare global {
  interface Window {
    trends?: {
      embed: {
        renderExploreWidget: (
          type: string,
          config: any,
          options: any
        ) => void;
      };
    };
  }
}

export const GoogleKeywordsSection = ({ content }: GoogleKeywordsSectionProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  // Sort keywords by relevance score and take top 5
  const topKeywords = [...content.keywords]
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);

  useEffect(() => {
    // Check if script is already loaded
    if (window.trends) {
      setScriptLoaded(true);
      return;
    }

    // Load Google Trends embed script
    const script = document.createElement("script");
    script.src = "https://ssl.gstatic.com/trends_nrtr/4271_RC01/embed_loader.js";
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !chartContainerRef.current || !window.trends) {
      return;
    }

    // Clear container first
    const container = chartContainerRef.current;
    container.innerHTML = "";

    // Create a wrapper div for the trends widget
    const widgetWrapper = document.createElement("div");
    widgetWrapper.style.width = "100%";
    widgetWrapper.style.height = "450px";
    widgetWrapper.style.position = "relative";
    container.appendChild(widgetWrapper);

    // Prepare comparison items for top keywords
    const comparisonItems = topKeywords.map((keyword) => ({
      keyword: keyword.term,
      geo: "US",
      time: "today 12-m", // Last 12 months
    }));

    // Generate query string for URL
    const queryParams = topKeywords.map((k) => k.term).join(",");
    const exploreQuery = `date=today%2012-m&geo=US&q=${encodeURIComponent(queryParams)}&hl=en`;

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      try {
        // Render Google Trends widget into the wrapper
        window.trends!.embed.renderExploreWidget(
          "TIMESERIES",
          {
            comparisonItem: comparisonItems,
            category: 0,
            property: "",
          },
          {
            exploreQuery,
            guestPath: "https://trends.google.com:443/trends/embed/",
          }
        );

        // Apply containment styles to the generated iframe
        setTimeout(() => {
          const iframe = widgetWrapper.querySelector("iframe");
          if (iframe) {
            iframe.style.width = "100%";
            iframe.style.height = "450px";
            iframe.style.border = "none";
          }
        }, 100);
      } catch (error) {
        console.error("Failed to render Google Trends widget:", error);
      }
    }, 50);
  }, [scriptLoaded, topKeywords]);

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
            <div
              ref={chartContainerRef}
              className="relative h-[450px] w-full"
              style={{ maxWidth: "100%", isolation: "isolate" }}
            >
              {!scriptLoaded && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-text-secondary">Loading Google Trends chart...</div>
                </div>
              )}
            </div>
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
                    <td className="px-4 py-3 text-sm text-text-secondary">{keyword.searchVolume}</td>
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
