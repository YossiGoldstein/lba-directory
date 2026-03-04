import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { PLANS } from "@/components/lib/plansConfig";

export default function UpgradeTab({ business }) {
  const [loading, setLoading] = useState(null);
  const currentTier = business.listing_tier || "free";

  const handleUpgrade = async (planId) => {
    if (planId === "free") return;

    if (window.self !== window.top) {
      toast.error("Payment checkout must be completed from the published app.");
      return;
    }

    setLoading(planId);
    try {
      const response = await base44.functions.invoke("createCheckoutSession", {
        listing_tier: planId,
        business_data: { business_id: business.id }
      });
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to start upgrade process");
    } finally {
      setLoading(null);
    }
  };

  const currentPlan = PLANS.find(p => p.id === currentTier) || PLANS[0];

  return (
    <div className="space-y-6">
      {/* Current Plan Banner */}
      <Card className={`border-2 ${currentPlan.borderColor}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${currentPlan.bgColor} ${currentPlan.color}`}>
              {currentPlan.name}
            </span>
            <span className="text-gray-600 text-sm">{currentPlan.price} / {currentPlan.period}</span>
          </div>
        </CardContent>
      </Card>

      {/* All Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          const isCurrentPlan = currentTier === plan.id;

          return (
            <div
              key={plan.id}
              className={`relative border-2 rounded-xl p-5 flex flex-col transition-all ${plan.borderColor} ${
                isCurrentPlan ? "ring-2 ring-offset-2 ring-cyan-500 shadow-md" : ""
              }`}
            >
              {plan.badge && (
                <Badge className={`absolute -top-3 left-4 ${plan.color} ${plan.bgColor}`}>
                  {plan.badge}
                </Badge>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full ${plan.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${plan.color}`} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{plan.name}</p>
                  <p className="text-sm text-gray-500">
                    <span className="text-xl font-bold text-gray-900">{plan.price}</span>
                    {" "}/{plan.period}
                  </p>
                </div>
                {isCurrentPlan && <CheckCircle className="w-5 h-5 text-cyan-600 ml-auto" />}
              </div>

              <ul className="space-y-1.5 mb-5 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-sm text-gray-700">
                    <Check className={`w-4 h-4 ${plan.color} flex-shrink-0 mt-0.5`} />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <Button disabled className="w-full">Current Plan</Button>
              ) : (
                <Button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id}
                  className={`w-full ${
                    plan.id === "premium" ? "bg-purple-600 hover:bg-purple-700" :
                    plan.id === "pro" ? "bg-cyan-600 hover:bg-cyan-700" :
                    plan.id === "lba-sponsor" ? "bg-blue-600 hover:bg-blue-700" :
                    "bg-gray-500 hover:bg-gray-600"
                  }`}
                >
                  {loading === plan.id ? "Processing..." : plan.id === "free" ? "Downgrade" : "Upgrade Now"}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-center text-gray-500">All plan changes require admin approval before going live.</p>
    </div>
  );
}