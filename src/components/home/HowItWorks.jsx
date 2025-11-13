import React from "react";
import { Search, Tag, Heart, TrendingUp } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Search the Directory",
      description: "Find local businesses by category, keyword, or location.",
      color: "blue"
    },
    {
      icon: Tag,
      title: "Discover Deals",
      description: "See the latest sales and promotions from local shops.",
      color: "green"
    },
    {
      icon: Heart,
      title: "Save & Review",
      description: "Create an account to save favorites and leave reviews.",
      color: "purple"
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Business owners can list and promote their services.",
      color: "orange"
    }
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600"
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Getting started with LBA Directory is simple and straightforward
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line (hidden on mobile, shown on desktop for all but last) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-1/2 w-full h-0.5 bg-gray-200 z-0"></div>
              )}

              {/* Card */}
              <div className="relative z-10 text-center">
                {/* Icon Circle */}
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full ${colorClasses[step.color]} flex items-center justify-center shadow-lg`}>
                  <step.icon className="w-12 h-12" />
                </div>

                {/* Step Number */}
                <div className="inline-block px-3 py-1 bg-gray-900 text-white text-sm font-bold rounded-full mb-4">
                  Step {index + 1}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}