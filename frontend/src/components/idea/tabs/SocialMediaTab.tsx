import { Card, CardHeader, CardTitle, CardContent } from "@/components/common/Card";
import { Share2 } from "lucide-react";

export const SocialMediaTab = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle icon={<Share2 size={28} />}>Social Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Share2 size={48} className="mx-auto mb-4 text-text-secondary opacity-50" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">Coming Soon</h3>
            <p className="text-text-secondary max-w-md mx-auto">
              Social media campaign management and content planning will be available here soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
