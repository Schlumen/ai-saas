import { Settings } from "lucide-react";

import Heading from "@/components/heading";
import { checkSubscription } from "@/lib/subscription";
import { SubscriptionButton } from "@/components/subscription-button";
import { Progress } from "@/components/ui/progress";
import { getApiUsage } from "@/lib/api-limit";
import { API_LIMITS } from "@/constants";
import React from "react";

type ApiType = "text" | "image" | "video" | "music";

const SettingsPage = async () => {
  const isPro = await checkSubscription();
  const usage = await getApiUsage();
  const limits = API_LIMITS;

  return (
    <div>
      <Heading
        title="Settings"
        description="Manage your account settings"
        icon={Settings}
        iconColor="text-gray-700"
        bgColor="bg-gray-700/10"
      />
      <div className="px-4 lg:px-8 space-y-4">
        <div className="text-muted-foreground text-sm">
          {isPro
            ? "You are currently subscribed to the Pro plan"
            : "You are not subscribed to the Pro plan"}
        </div>
        <SubscriptionButton isPro={isPro} />
        {isPro && (
          <div className="space-y-3 text-muted-foreground max-w-xs bg-gray-700/10 rounded-lg p-4">
            <div className="text-lg text-[#111827]">
              Generation usage and limits
            </div>
            {Object.entries(limits).map(([key, value]) => (
              <div
                className="space-y-2"
                key={key}
              >
                <p className="capitalize">
                  {usage[`${key as ApiType}Count`]} / {value} {key} Generations
                </p>
                <Progress
                  className="h-3 bg-white"
                  value={(usage[`${key as ApiType}Count`] / value) * 100}
                />
              </div>
            ))}
            <div className="text-xs">
              Your usage resets on the next payment cycle
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
