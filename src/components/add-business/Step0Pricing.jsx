import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";

export default function Step0Pricing({ formData, setFormData, onNext }) {
  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "forever",
      icon: Zap,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      features: [
        "Basic business listing",
        "Contact information",
        "Business hours",
        "Up to 3 photos",
        "Customer reviews"
      ]
    },
    {
      id: "pro",
      name: "Pro",
      price: "$50",
      period: "per month",
      icon: Sparkles,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-300",
      badge: "Popular",
      features: [
        "Everything in Free",
        "Featured placement in category",
        "Up to 10 photos",
        "Gallery showcase",
        "Create deals & promotions",
        "Social media links",
        "Advanced analytics"
      ]
    },
    {
      id: "premium",
      name: "Premium",
      price: "$100",
      period: "per month",
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      badge: "Best Value",
      features: [
        "Everything in Pro",
        "Top priority placement",
        "Unlimited photos",
        "Verified badge",
        "AI-powered insights",
        "Priority customer support",
        "Homepage featured section",
        "Monthly performance report"
      ]
    }
  ];

  const handleSelectPlan = (planId) => {
    setFormData({ ...formData, listing_tier: planId });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Listing Plan
        </h2>
        <p className="text-gray-600">
          Select the plan that best fits your business needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = formData.listing_tier === plan.id;

          return (
            <Card
              key={plan.id}
              className={`relative transition-all cursor-pointer ${
                isSelected
                  ? `ring-2 ring-offset-2 ${plan.color.replace('text-', 'ring-')} shadow-lg scale-105`
                  : 'hover:shadow-md'
              } ${plan.borderColor} border-2`}
              onClick={() => handleSelectPlan(plan.id)}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className={`${plan.color} ${plan.bgColor}`}>
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto ${plan.bgColor} rounded-full flex items-center justify-center mb-4`}>
                  <Icon className={`w-8 h-8 ${plan.color}`} />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 ml-2">/{plan.period}</span>
                  </div>
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 ${plan.color} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full mt-6 ${
                    isSelected
                      ? plan.id === 'premium'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : plan.id === 'pro'
                        ? 'bg-cyan-600 hover:bg-cyan-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                      : 'bg-white text-gray-900 border-2 border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.id);
                    onNext();
                  }}
                >
                  {isSelected ? 'Selected - Continue' : 'Select Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-8 text-sm text-gray-500">
        <p>All plans include a 7-day free trial. Cancel anytime.</p>
        <p className="mt-1">Paid plans require admin approval before going live.</p>
      </div>
    </div>
  );
}