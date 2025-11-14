import React from "react";
import { Check } from "lucide-react";

export default function WizardProgress({ currentStep, totalSteps }) {
  const steps = [
    "Business Basics",
    "Category & Tags",
    "Location & Contact",
    "Hours of Operation",
    "Gallery",
    "Deals (Optional)",
    "AI Optimization",
    "Review & Submit"
  ];

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators - Hidden on mobile */}
        <div className="hidden md:flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                  index < currentStep
                    ? "bg-cyan-600 border-cyan-600 text-white"
                    : index === currentStep
                    ? "bg-white border-cyan-600 text-cyan-600"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`text-xs mt-2 text-center max-w-[80px] ${
                  index === currentStep ? "text-cyan-600 font-medium" : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* Mobile: Current Step */}
        <div className="md:hidden text-center">
          <p className="text-sm text-gray-600">
            Step {currentStep + 1} of {totalSteps}
          </p>
          <p className="text-lg font-semibold text-gray-900">{steps[currentStep]}</p>
        </div>
      </div>
    </div>
  );
}