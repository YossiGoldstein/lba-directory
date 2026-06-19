import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PLANS } from "@/components/lib/plansConfig";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Pricing &amp; Packages</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your business. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative bg-white border-2 ${plan.borderColor} rounded-2xl p-6 flex flex-col shadow-sm`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-semibold ${plan.bgColor} ${plan.color}`}>
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-full ${plan.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${plan.color}`} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{plan.name}</p>
                    <p className="text-sm text-gray-500">
                      <span className="text-2xl font-bold text-gray-900">{plan.price}</span> /{plan.period}
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className={`w-4 h-4 ${plan.color} flex-shrink-0 mt-0.5`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-cyan-600 hover:bg-cyan-700">
                  <Link to={createPageUrl("AddBusiness")}>
                    {plan.id === "free" ? "Get Started Free" : `Choose ${plan.name}`}
                  </Link>
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          All paid plans require admin approval before going live. Questions? Email{" "}
          <a href="mailto:office@lbadirectory.com" className="text-cyan-600 underline">office@lbadirectory.com</a>.
        </p>
      </div>
    </div>
  );
}
