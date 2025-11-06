import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { Users } from "lucide-react";

export const LeadsTab = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle icon={<Users size={28} />}>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Users size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Coming Soon</h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Lead generation and management tools will be available here soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
