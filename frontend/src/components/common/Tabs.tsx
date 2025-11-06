import { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onTabChange, className }: TabsProps) => {
  return (
    <div className={cn("border-b border-border", className)}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:border-border hover:text-text-primary"
            )}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

interface TabPanelProps {
  children: ReactNode;
  isActive: boolean;
  className?: string;
}

export const TabPanel = ({ children, isActive, className }: TabPanelProps) => {
  if (!isActive) return null;

  return <div className={cn("py-6", className)}>{children}</div>;
};
