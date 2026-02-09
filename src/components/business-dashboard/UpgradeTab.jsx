import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, Zap, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function UpgradeTab({ business }) {
  const [loading, setLoading] = useState(null);

  const { data: packages = [] } = useQuery({
    queryKey: ["packages"],
    queryFn: () => base44.entities.Package.list(),
  });

  const currentTier = business.listing_tier || "free";
  const sortedPackages = packages
    .filter(p => p.is_active)
    .sort((a, b) => (a.price_per_month || 0) - (b.price_per_month || 0));

  const handleUpgrade = async (packageId) => {
    setLoading(packageId);
    try {
      const response = await base44.functions.invoke("createCheckoutSession", {
        businessId: business.id,
        packageId: packageId,
      });

      if (response.data.url) {
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

  const getTierBadge = (tier) => {
    const badges = {
      free: { text: "Free", color: "bg-gray-100 text-gray-700" },
      pro: { text: "Pro", color: "bg-blue-100 text-blue-700" },
      premium: { text: "Premium", color: "bg-purple-100 text-purple-700" },
    };
    return badges[tier] || badges.free;
  };

  const currentBadge = getTierBadge(currentTier);

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${currentBadge.color}`}>
                {currentBadge.text}
              </span>
              <p className="text-sm text-gray-600 mt-2">
                {currentTier === "free" && "Basic listing with limited features"}
                {currentTier === "pro" && "Enhanced visibility and features"}
                {currentTier === "premium" && "Maximum visibility and all features"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sortedPackages.map((pkg) => {
          const isCurrentPlan = business.package_id === pkg.id;
          const price = pkg.price_per_month || 0;
          const isPro = pkg.slug === "pro" || price > 0 && price < 100;
          const isPremium = pkg.slug === "premium" || price >= 100;

          return (
            <Card
              key={pkg.id}
              className={`relative ${
                isPremium ? "border-2 border-purple-500 shadow-lg" : ""
              } ${isCurrentPlan ? "bg-blue-50 border-blue-300" : ""}`}
            >
              {isPremium && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-1 rounded-full text-xs font-semibold shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-2">
                  {pkg.is_free ? (
                    <Zap className="w-10 h-10 text-gray-400" />
                  ) : isPro ? (
                    <TrendingUp className="w-10 h-10 text-blue-600" />
                  ) : (
                    <Crown className="w-10 h-10 text-purple-600" />
                  )}
                </div>
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    ${price}
                  </span>
                  <span className="text-gray-600">/{pkg.billing_period_type === "yearly" ? "year" : "month"}</span>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-600 mb-4 text-center min-h-[40px]">
                  {pkg.description_short}
                </p>

                <ul className="space-y-2 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>{pkg.max_listings} listing{pkg.max_listings !== 1 ? "s" : ""}</span>
                  </li>
                  {pkg.can_add_photos && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Up to {pkg.max_photos || "unlimited"} photos</span>
                    </li>
                  )}
                  {pkg.can_add_videos && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Video uploads</span>
                    </li>
                  )}
                  {pkg.can_feature_business && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Featured placement</span>
                    </li>
                  )}
                  {pkg.can_see_stats && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Analytics & stats</span>
                    </li>
                  )}
                  {pkg.can_create_deals && (
                    <li className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Create deals</span>
                    </li>
                  )}
                </ul>

                {isCurrentPlan ? (
                  <Button disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleUpgrade(pkg.id)}
                    disabled={loading === pkg.id}
                    className={`w-full ${
                      isPremium
                        ? "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                        : isPro
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    }`}
                  >
                    {loading === pkg.id ? "Processing..." : pkg.is_free ? "Downgrade" : "Upgrade Now"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Why Upgrade?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Better Visibility</h4>
                <p className="text-sm text-gray-600">Appear higher in search results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Crown className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Premium Features</h4>
                <p className="text-sm text-gray-600">Access to all platform features</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}