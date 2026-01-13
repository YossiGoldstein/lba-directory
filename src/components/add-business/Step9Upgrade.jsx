import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Users, TrendingUp } from "lucide-react";

export default function Step9Upgrade({ data, onChange }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Would you like to upgrade your plan?
        </h2>
        <p className="text-gray-600">
          Choose the plan that best fits your business
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={`cursor-pointer transition-all ${data.listing_tier === "free" ? "ring-2 ring-cyan-600 shadow-lg" : ""}`}
          onClick={() => onChange({ ...data, listing_tier: "free" })}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Free</CardTitle>
              <Badge className="bg-gray-100 text-gray-800">Current</Badge>
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">₪0</p>
            <p className="text-sm text-gray-500">לחודש</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Directory listing</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Display up to 3 images</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Ratings and reviews</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Contact form</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className={`cursor-pointer transition-all ${data.listing_tier === "pro" ? "ring-2 ring-cyan-600 shadow-lg" : "hover:shadow-lg"}`}
          onClick={() => onChange({ ...data, listing_tier: "pro" })}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle>Pro</CardTitle>
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              {data.listing_tier === "pro" && <Badge className="bg-cyan-100 text-cyan-800">Selected</Badge>}
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">₪99</p>
            <p className="text-sm text-gray-500">לחודש</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold text-cyan-900">🎯 Best for small businesses</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">All free plan benefits</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Unlimited images</span>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Priority ranking in search</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Create deals and coupons</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Analytics and statistics</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex gap-3">
          <Users className="w-6 h-6 text-blue-600 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">💡 Special Offer</h4>
            <p className="text-sm text-gray-700">
              Upgrade to Pro and get your first month for just $49! After that, only $99/month.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <p className="text-sm text-gray-700">
          <strong>📝 Note:</strong> You can upgrade or change your plan anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}